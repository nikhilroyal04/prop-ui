import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Building, Loader2, Edit2, Trash2, ChevronLeft, ChevronRight, Search, ChevronUp, ChevronDown } from 'lucide-react';
import {
  Grid,
  GridItem,
  Box,
  Card,
  CardBody,
  Text,
  Heading,
  Button,
  useToast,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Image,
  AspectRatio,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  VStack,
  Collapse,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react';
import {
  selectProperties,
  selectError,
  selectLoading,
  fetchProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../app/features/propertySlice';
import AddProperty from './AddProperty';


export default function Properties() {
  const dispatch = useDispatch();
  const toast = useToast({
    position: 'top-right',
    duration: 3000,
    isClosable: true,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const properties = useSelector(selectProperties);
  
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('title');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    propertyType: '',
    propertySubtype: '',
    transactionType: '',
    minRate: '',
    maxRate: '',
    location: '',
    propertyNo: '',
  });
  const [filteredProperties, setFilteredProperties] = useState([]);

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  // Filter properties based on search query and filters
  useEffect(() => {
    if (!properties || properties.length === 0) {
      setFilteredProperties([]);
      return;
    }

    let filtered = [...properties];

    // Apply basic search
    if (searchQuery) {
      filtered = filtered.filter(property => {
        const fieldValue = property[searchField]?.toString().toLowerCase() || '';
        return fieldValue.includes(searchQuery.toLowerCase());
      });
    }

    // Apply advanced filters
    if (advancedFilters.propertyType) {
      filtered = filtered.filter(property => 
        property.propertyType === advancedFilters.propertyType
      );
    }

    if (advancedFilters.propertySubtype) {
      filtered = filtered.filter(property => 
        property.propertySubtype === advancedFilters.propertySubtype
      );
    }

    if (advancedFilters.transactionType) {
      filtered = filtered.filter(property => 
        property.transactionType === advancedFilters.transactionType
      );
    }

    if (advancedFilters.minRate) {
      filtered = filtered.filter(property => {
        const rate = parseFloat(property.rate?.replace(/[^0-9.]/g, '') || 0);
        return rate >= parseFloat(advancedFilters.minRate);
      });
    }

    if (advancedFilters.maxRate) {
      filtered = filtered.filter(property => {
        const rate = parseFloat(property.rate?.replace(/[^0-9.]/g, '') || 0);
        return rate <= parseFloat(advancedFilters.maxRate);
      });
    }

    if (advancedFilters.location) {
      filtered = filtered.filter(property => 
        property.location?.toLowerCase().includes(advancedFilters.location.toLowerCase())
      );
    }

    if (advancedFilters.propertyNo) {
      filtered = filtered.filter(property => 
        property.propertyNo?.toLowerCase().includes(advancedFilters.propertyNo.toLowerCase())
      );
    }

    setFilteredProperties(filtered);
    
    // Reset current property index if it's out of bounds
    if (currentPropertyIndex >= filtered.length) {
      setCurrentPropertyIndex(0);
    }
  }, [properties, searchQuery, searchField, advancedFilters, currentPropertyIndex]);

  // Handle advanced filter changes
  const handleAdvancedFilterChange = (e) => {
    const { name, value } = e.target;
    setAdvancedFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSearchField('title');
    setAdvancedFilters({
      propertyType: '',
      propertySubtype: '',
      transactionType: '',
      minRate: '',
      maxRate: '',
      location: '',
      propertyNo: '',
    });
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      
      // Log the form data for debugging
      console.log("Form data received:", formData);
      
      // Check if formData is empty
      if (!formData || (formData instanceof FormData && formData.entries().next().done)) {
        toast({
          title: "Error",
          description: "No data to submit. Please fill in at least one field.",
          status: "error",
          duration: 3000,
        });
        setIsSubmitting(false);
        return;
      }
      
      if (isEditing && selectedProperty) {
        // Log the data being sent for debugging
        console.log("Updating property with ID:", selectedProperty.id);
        
        await dispatch(updateProperty(selectedProperty.id, formData));
        toast({
          title: "Property updated",
          status: "success",
          duration: 3000,
        });
      } else {
        // Log the data being sent for debugging
        console.log("Creating new property");
        
        await dispatch(createProperty(formData));
        toast({
          title: "Property created",
          status: "success",
          duration: 3000,
        });
      }
      // Refresh properties list
      await dispatch(fetchProperties());
      handleReset();
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await dispatch(deleteProperty(propertyToDelete.id));
      toast({
        title: "Property deleted",
        status: "success",
        duration: 3000,
      });
      if (selectedProperty?.id === propertyToDelete.id) {
        handleReset();
      }
      // Refresh properties list
      await dispatch(fetchProperties());
      onClose();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedProperty(null);
    setIsEditing(false);
  };

  const handleDeleteClick = (property, e) => {
    e.stopPropagation();
    setPropertyToDelete(property);
    onOpen();
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleNextImage = () => {
    const totalImages = properties[currentPropertyIndex].images?.length || 0;
    const totalVideos = properties[currentPropertyIndex].videos?.length || 0;
    const totalMedia = totalImages + totalVideos;
    
    if (currentImageIndex < totalMedia - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const handleNextProperty = () => {
    if (currentPropertyIndex < properties.length - 1) {
      setCurrentPropertyIndex(prev => prev + 1);
      setCurrentImageIndex(0);
      // Reset edit mode when changing properties
      setIsEditing(false);
      setSelectedProperty(null);
    }
  };

  const handlePreviousProperty = () => {
    if (currentPropertyIndex > 0) {
      setCurrentPropertyIndex(prev => prev - 1);
      setCurrentImageIndex(0);
      // Reset edit mode when changing properties
      setIsEditing(false);
      setSelectedProperty(null);
    }
  };

  // Reset image index when property changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [currentPage]);

  // Handle property selection for editing
  const handleEditProperty = (property) => {
    // Create a clean copy of the property for editing
    const propertyForEdit = {
      ...property,
      images: property.images || [], // Ensure images array exists
      carpetAreaUnit: property.carpetAreaUnit || 'sqft', // Default unit if not set
      loanAvailable: property.loanAvailable || 'no',
      reraApproved: property.reraApproved || 'no'
    };
    setSelectedProperty(propertyForEdit);
    setIsEditing(true);
    // Scroll to form on mobile
    if (window.innerWidth < 768) {
      document.getElementById('property-form').scrollIntoView({ 
        behavior: 'smooth' 
      });
    }
  };

  if (loading && !isSubmitting) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Loader2 className="animate-spin" size={32} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Text color="red.500">Error: {error}</Text>
      </Box>
    );
  }

  return (
    <Box p={6} height={["auto", "auto", "100vh"]} overflow="hidden">
      {/* Search Bar */}
      <Card mb={6}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Search color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              <Select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                width="200px"
              >
                <option value="title">Title</option>
                <option value="propertyNo">Property Number</option>
                <option value="location">Location</option>
                <option value="ownerName">Owner Name</option>
                <option value="description">Description</option>
                <option value="amenities">Amenities</option>
              </Select>
              <Button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                variant="outline"
                rightIcon={showAdvancedSearch ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                
              >
                {showAdvancedSearch ? 'Hide' : 'Filters'}
              </Button>
              <Button
                onClick={resetFilters}
                variant="ghost"
                colorScheme="red"
              >
                Reset
              </Button>
            </HStack>

            <Collapse in={showAdvancedSearch} animateOpacity>
              <Box p={4} borderWidth={1} borderRadius="md" bg="gray.50">
                <Heading size="sm" mb={4}>Advanced Filters</Heading>
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Property Number</FormLabel>
                      <Input
                        name="propertyNo"
                        value={advancedFilters.propertyNo}
                        onChange={handleAdvancedFilterChange}
                        placeholder="Enter property number"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Property Type</FormLabel>
                      <Select
                        name="propertyType"
                        value={advancedFilters.propertyType}
                        onChange={handleAdvancedFilterChange}
                      >
                        <option value="">All Types</option>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="industrial">Industrial</option>
                        <option value="agricultural">Agricultural</option>
                      </Select>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Property Subtype</FormLabel>
                      <Select
                        name="propertySubtype"
                        value={advancedFilters.propertySubtype}
                        onChange={handleAdvancedFilterChange}
                      >
                        <option value="">All Subtypes</option>
                        {advancedFilters.propertyType === 'residential' && (
                          <>
                            <option value="apartment">Apartment</option>
                            <option value="villa">Villa</option>
                            <option value="duplex">Duplex</option>
                            <option value="triplex">Triplex</option>
                            <option value="penthouse">Penthouse</option>
                            <option value="studio">Studio Apartment</option>
                            <option value="plot">Plot</option>
                            <option value="house">Independent House</option>
                            <option value="pg">PG/Hostel</option>
                          </>
                        )}
                        {advancedFilters.propertyType === 'commercial' && (
                          <>
                            <option value="office">Office Space</option>
                            <option value="retail">Retail Shop</option>
                            <option value="warehouse">Warehouse</option>
                            <option value="showroom">Showroom</option>
                            <option value="commercialPlot">Commercial Plot</option>
                            <option value="hotel">Hotel</option>
                            <option value="restaurant">Restaurant</option>
                            <option value="school">School</option>
                            <option value="college">College</option>
                            <option value="hospital">Hospital</option>
                          </>
                        )}
                        {advancedFilters.propertyType === 'industrial' && (
                          <>
                            <option value="factory">Factory</option>
                            <option value="industrialPlot">Industrial Plot</option>
                            <option value="industrialShed">Industrial Shed</option>
                            <option value="warehouse">Warehouse</option>
                          </>
                        )}
                        {advancedFilters.propertyType === 'agricultural' && (
                          <>
                            <option value="farm">Farm</option>
                            <option value="orchard">Orchard</option>
                            <option value="plantation">Plantation</option>
                            <option value="agriculturalPlot">Agricultural Plot</option>
                          </>
                        )}
                      </Select>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Listing Type</FormLabel>
                      <Select
                        name="transactionType"
                        value={advancedFilters.transactionType}
                        onChange={handleAdvancedFilterChange}
                      >
                        <option value="">All Types</option>
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                        <option value="lease">For Lease</option>
                      </Select>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Min Rate</FormLabel>
                      <Input
                        name="minRate"
                        value={advancedFilters.minRate}
                        onChange={handleAdvancedFilterChange}
                        placeholder="Min price"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Max Rate</FormLabel>
                      <Input
                        name="maxRate"
                        value={advancedFilters.maxRate}
                        onChange={handleAdvancedFilterChange}
                        placeholder="Max price"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Location</FormLabel>
                      <Input
                        name="location"
                        value={advancedFilters.location}
                        onChange={handleAdvancedFilterChange}
                        placeholder="Enter location"
                      />
                    </FormControl>
                  </GridItem>
                </Grid>
              </Box>
            </Collapse>
          </VStack>
        </CardBody>
      </Card>

      <Grid 
        templateColumns={["1fr", "1fr", "repeat(2, 1fr)"]}
        templateRows={["auto auto", "auto auto", "1fr"]}
        gap={6} 
        height={["auto", "auto", "calc(100vh - 150px)"]}
      >
        {/* Property View - Full width on small screens */}
        <GridItem 
          colSpan={[1, 1, 1]} 
          height={["auto", "auto", "full"]} 
          overflow="hidden"
        >
          <Card height={["auto", "auto", "full"]}>
            <CardBody display="flex" flexDirection="column" overflow={["visible", "visible", "hidden"]}>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">Properties ({filteredProperties?.length || 0})</Heading>
                {filteredProperties.length > 0 && (
                  <Text>
                    Property {currentPropertyIndex + 1} of {filteredProperties.length}
                  </Text>
                )}
              </Flex>

              {filteredProperties.length > 0 ? (
                <Box flex="1" overflow={["visible", "visible", "auto"]}>
                  <Card variant="outline">
                    <CardBody>
                      {/* Image/Video Carousel */}
                      <Box mb={4} position="relative" borderRadius="md" overflow="hidden">
                        <AspectRatio ratio={16/9}>
                          {filteredProperties[currentPropertyIndex].images && filteredProperties[currentPropertyIndex].images.length > 0 ? (
                            currentImageIndex < filteredProperties[currentPropertyIndex].images.length ? (
                              <Image
                                src={filteredProperties[currentPropertyIndex].images[currentImageIndex]}
                                alt={filteredProperties[currentPropertyIndex].title}
                                objectFit="cover"
                              />
                            ) : filteredProperties[currentPropertyIndex].videos && filteredProperties[currentPropertyIndex].videos.length > 0 ? (
                              <video
                                src={filteredProperties[currentPropertyIndex].videos[currentImageIndex - filteredProperties[currentPropertyIndex].images.length]}
                                controls
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <Box bg="gray.100" display="flex" alignItems="center" justifyContent="center">
                                <Building size={60} />
                              </Box>
                            )
                          ) : filteredProperties[currentPropertyIndex].videos && filteredProperties[currentPropertyIndex].videos.length > 0 ? (
                            <video
                              src={filteredProperties[currentPropertyIndex].videos[currentImageIndex]}
                              controls
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Box bg="gray.100" display="flex" alignItems="center" justifyContent="center">
                              <Building size={60} />
                            </Box>
                          )}
                        </AspectRatio>
                        
                        {/* Image/Video Navigation */}
                        {((filteredProperties[currentPropertyIndex].images && filteredProperties[currentPropertyIndex].images.length > 0) ||
                          (filteredProperties[currentPropertyIndex].videos && filteredProperties[currentPropertyIndex].videos.length > 0)) && (
                          <>
                            <IconButton
                              icon={<ChevronLeft size={20} />}
                              position="absolute"
                              left={2}
                              top="50%"
                              transform="translateY(-50%)"
                              onClick={handlePrevImage}
                              colorScheme="blackAlpha"
                              aria-label="Previous"
                              isRound
                              size="sm"
                              isDisabled={currentImageIndex === 0}
                            />
                            <IconButton
                              icon={<ChevronRight size={20} />}
                              position="absolute"
                              right={2}
                              top="50%"
                              transform="translateY(-50%)"
                              onClick={handleNextImage}
                              colorScheme="blackAlpha"
                              aria-label="Next"
                              isRound
                              size="sm"
                              isDisabled={
                                currentImageIndex >= (
                                  (filteredProperties[currentPropertyIndex].images?.length || 0) +
                                  (filteredProperties[currentPropertyIndex].videos?.length || 0) - 1
                                )
                              }
                            />
                            <Text
                              position="absolute"
                              bottom={2}
                              right={2}
                              bg="blackAlpha.600"
                              color="white"
                              px={2}
                              py={1}
                              borderRadius="md"
                              fontSize="sm"
                            >
                              {currentImageIndex + 1} / {(filteredProperties[currentPropertyIndex].images?.length || 0) + (filteredProperties[currentPropertyIndex].videos?.length || 0)}
                            </Text>
                          </>
                        )}
                      </Box>

                      {/* Property Details */}
                      <Box>
                        <Heading size="lg" mb={4}>{filteredProperties[currentPropertyIndex].title}</Heading>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500" mb={6}>
                          ₹{filteredProperties[currentPropertyIndex].rate}
                        </Text>
                        
                        <Grid templateColumns={["1fr", "repeat(2, 1fr)"]} gap={4} mb={6}>
                          {/* Essential Property Details */}
                          <Box>
                            <Text fontWeight="bold">Property Number</Text>
                            <Text>{filteredProperties[currentPropertyIndex].propertyNo || 'N/A'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Property Type</Text>
                            <Text textTransform="capitalize">{filteredProperties[currentPropertyIndex].propertyType || 'N/A'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Property Subtype</Text>
                            <Text textTransform="capitalize">{filteredProperties[currentPropertyIndex].propertySubtype || 'N/A'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Listing Type</Text>
                            <Text textTransform="capitalize">{filteredProperties[currentPropertyIndex].transactionType?.replace(/([A-Z])/g, ' $1') || 'N/A'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Carpet Area</Text>
                            <Text>
                              {filteredProperties[currentPropertyIndex].carpetArea 
                                ? `${filteredProperties[currentPropertyIndex].carpetArea} ${filteredProperties[currentPropertyIndex].carpetAreaUnit?.toUpperCase() || 'SQFT'}`
                                : 'N/A'
                              }
                            </Text>
                          </Box>

                          {/* Location */}
                          <Box>
                            <Text fontWeight="bold">Location</Text>
                            <Text textTransform="capitalize">{filteredProperties[currentPropertyIndex].location || 'N/A'}</Text>
                          </Box>
                          {filteredProperties[currentPropertyIndex].landmark && (
                            <Box>
                              <Text fontWeight="bold">Landmark</Text>
                              <Text>{filteredProperties[currentPropertyIndex].landmark}</Text>
                            </Box>
                          )}

                          {/* Ownership Details */}
                          <Box>
                            <Text fontWeight="bold">Loan Available</Text>
                            <Text textTransform="capitalize">{filteredProperties[currentPropertyIndex].loanAvailable || 'N/A'}</Text>
                          </Box>
                          {filteredProperties[currentPropertyIndex].loanAvailable === 'yes' && (
                            <Box>
                              <Text fontWeight="bold">Bank Name</Text>
                              <Text>{filteredProperties[currentPropertyIndex].bankName || 'N/A'}</Text>
                            </Box>
                          )}
                          {filteredProperties[currentPropertyIndex].reraApproved === 'yes' && (
                            <Box>
                              <Text fontWeight="bold">RERA Number</Text>
                              <Text>{filteredProperties[currentPropertyIndex].reraNumber}</Text>
                            </Box>
                          )}

                          {/* Property Features */}
                          {filteredProperties[currentPropertyIndex].bedrooms && (
                            <Box>
                              <Text fontWeight="bold">Bedrooms</Text>
                              <Text>{filteredProperties[currentPropertyIndex].bedrooms}</Text>
                            </Box>
                          )}
                          {filteredProperties[currentPropertyIndex].bathrooms && (
                            <Box>
                              <Text fontWeight="bold">Bathrooms</Text>
                              <Text>{filteredProperties[currentPropertyIndex].bathrooms}</Text>
                            </Box>
                          )}
                          {filteredProperties[currentPropertyIndex].facing && (
                            <Box>
                              <Text fontWeight="bold">Facing</Text>
                              <Text textTransform="capitalize">{filteredProperties[currentPropertyIndex].facing}</Text>
                            </Box>
                          )}
                          {filteredProperties[currentPropertyIndex].amenities && (
                            <Box>
                              <Text fontWeight="bold">Amenities</Text>
                              <Text>{filteredProperties[currentPropertyIndex].amenities}</Text>
                            </Box>
                          )}

                          {/* Contact Details */}
                          <Box>
                            <Text fontWeight="bold">Owner Name</Text>
                            <Text>{filteredProperties[currentPropertyIndex].ownerName || 'N/A'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Owner Contact</Text>
                            <Text>{filteredProperties[currentPropertyIndex].ownerContactNo || 'N/A'}</Text>
                          </Box>
                        </Grid>

                        {/* Description */}
                        {filteredProperties[currentPropertyIndex].description && (
                          <Box mb={6}>
                            <Text fontWeight="bold" mb={2}>Description</Text>
                            <Text>{filteredProperties[currentPropertyIndex].description}</Text>
                          </Box>
                        )}

                        {/* Action Buttons */}
                        <Flex gap={2}>
                          <Button
                            leftIcon={<Edit2 size={16} />}
                            colorScheme="blue"
                            onClick={() => handleEditProperty(filteredProperties[currentPropertyIndex])}
                            flex="1"
                          >
                            Edit
                          </Button>
                          <Button
                            leftIcon={<Trash2 size={16} />}
                            colorScheme="red"
                            onClick={(e) => handleDeleteClick(filteredProperties[currentPropertyIndex], e)}
                            flex="1"
                          >
                            Delete
                          </Button>
                        </Flex>
                      </Box>
                    </CardBody>
                  </Card>
                </Box>
              ) : (
                <Box flex="1" overflow={["visible", "visible", "auto"]}>
                  <Card variant="outline" height="full">
                    <CardBody display="flex" alignItems="center" justifyContent="center" flexDirection="column" gap={4}>
                      <Building size={60} color="gray" />
                      <Heading size="md" color="gray.500">No Properties Found</Heading>
                      <Text color="gray.400">Add a new property using the form on the right</Text>
                    </CardBody>
                  </Card>
                </Box>
              )}

              {/* Navigation Controls - Only show if there are properties */}
              {filteredProperties.length > 0 && (
                <Flex 
                  justify="space-between" 
                  align="center" 
                  mt={4}
                  flexDirection={["column", "row"]}
                  gap={[4, 0]}
                >
                  <Button
                    leftIcon={<ChevronLeft size={20} />}
                    onClick={handlePreviousProperty}
                    isDisabled={currentPropertyIndex === 0}
                    size="lg"
                    variant="ghost"
                    width={["full", "auto"]}
                  >
                    Previous Property
                  </Button>
                  <Text fontSize="sm" color="gray.600" order={["-1", "0"]}>
                    Property {currentPropertyIndex + 1} of {filteredProperties.length}
                  </Text>
                  <Button
                    rightIcon={<ChevronRight size={20} />}
                    onClick={handleNextProperty}
                    isDisabled={currentPropertyIndex === filteredProperties.length - 1}
                    size="lg"
                    variant="ghost"
                    width={["full", "auto"]}
                  >
                    Next Property
                  </Button>
                </Flex>
              )}
            </CardBody>
          </Card>
        </GridItem>

        {/* Property Form - Full width on small screens */}
        <GridItem 
          colSpan={[1, 1, 1]} 
          height={["auto", "auto", "full"]} 
          overflow="hidden"
          id="property-form"
        >
          <Card height={["auto", "auto", "full"]}>
            <CardBody display="flex" flexDirection="column" overflow="hidden">
              <Flex 
                justify="space-between" 
                align="center" 
                mb={4}
                flexDirection={["column", "row"]}
                gap={[2, 0]}
              >
                <Heading size="md">
                  {isEditing ? 'Edit Property' : 'Add New Property'}
                </Heading>
                {isEditing && (
                  <Button 
                    size="sm"
                    onClick={handleReset}
                    width={["full", "auto"]}
                  >
                    Cancel Edit
                  </Button>
                )}
              </Flex>
              
              <AddProperty
                onSubmit={handleSubmit}
                isEditing={isEditing}
                initialData={selectedProperty}
                onCancel={handleReset}
                key={selectedProperty ? selectedProperty.id : 'new'}
                isSubmitting={isSubmitting}
              />
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete the property "{propertyToDelete?.title}"?
            This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="gray" 
              mr={3} 
              onClick={onClose}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleDelete}
              isLoading={isSubmitting}
              loadingText="Deleting..."
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
} 