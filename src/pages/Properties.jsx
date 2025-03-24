import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Building, Loader2, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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


// const properties = [
//   {
//     title: 'Luxury Villa in Bali',
//     price: '500000',
//     location: 'Bali, Indonesia',
//     landMark: 'Near Ubud Monkey Forest',
//     bedrooms: '4',
//     bathrooms: '3',
//     area: '2500 sq. ft.',
//     images: [
//       'https://dummyimage.com/600x400/000/fff&text=Image+1',
//       'https://dummyimage.com/600x400/000/fff&text=Image+2',
//       'https://dummyimage.com/600x400/000/fff&text=Image+3',
//     ],
//     description: 'A luxurious villa with a private pool, modern amenities, and stunning views of the Balinese landscape.',
//     societyName: 'Bali Luxury Estates',
//     propertyType: 'Villa',
//     propertyStatus: 'For Sale',
//     propertyAge: '5 years',
//     propertyFacing: 'North',
//   },
//   {
//     title: 'Modern Apartment in New York',
//     price: '750000',
//     location: 'New York, USA',
//     landMark: 'Near Central Park',
//     bedrooms: '3',
//     bathrooms: '2',
//     area: '1800 sq. ft.',
//     images: [
//       'https://dummyimage.com/600x400/000/fff&text=Image+4',
//       'https://dummyimage.com/600x400/000/fff&text=Image+5',
//       'https://dummyimage.com/600x400/000/fff&text=Image+6',
//     ],
//     description: 'A modern apartment in the heart of New York City, close to Central Park and major attractions.',
//     societyName: 'Manhattan Heights',
//     propertyType: 'Apartment',
//     propertyStatus: 'For Sale',
//     propertyAge: '2 years',
//     propertyFacing: 'East',
//   },
//   {
//     title: 'Beach House in Malibu',
//     price: '1200000',
//     location: 'Malibu, California',
//     landMark: 'Near Malibu Beach',
//     bedrooms: '5',
//     bathrooms: '4',
//     area: '3500 sq. ft.',
//     images: [
//       'https://dummyimage.com/600x400/000/fff&text=Image+7',
//       'https://dummyimage.com/600x400/000/fff&text=Image+8',
//       'https://dummyimage.com/600x400/000/fff&text=Image+9',
//     ],
//     description: 'A stunning beach house with ocean views, private beach access, and luxurious interiors.',
//     societyName: 'Malibu Beach Residences',
//     propertyType: 'Beach House',
//     propertyStatus: 'For Sale',
//     propertyAge: '10 years',
//     propertyFacing: 'West',
//   },
// ];

export default function Properties() {
  const dispatch = useDispatch();
  const toast = useToast();
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

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (isEditing && selectedProperty) {
        await dispatch(updateProperty(selectedProperty.id, formData));
        toast({
          title: "Property updated",
          status: "success",
          duration: 3000,
        });
      } else {
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
      <Grid 
        templateColumns={["1fr", "1fr", "repeat(2, 1fr)"]}
        templateRows={["auto auto", "auto auto", "1fr"]}
        gap={6} 
        height={["auto", "auto", "calc(100vh - 48px)"]}
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
                <Heading size="md">Properties ({properties?.length || 0})</Heading>
                {properties.length > 0 && (
                  <Text>
                    Property {currentPropertyIndex + 1} of {properties.length}
                  </Text>
                )}
              </Flex>

              {properties.length > 0 ? (
                <Box flex="1" overflow={["visible", "visible", "auto"]}>
                  <Card variant="outline">
                    <CardBody>
                      {/* Image/Video Carousel */}
                      <Box mb={4} position="relative" borderRadius="md" overflow="hidden">
                        <AspectRatio ratio={16/9}>
                          {properties[currentPropertyIndex].images && properties[currentPropertyIndex].images.length > 0 ? (
                            currentImageIndex < properties[currentPropertyIndex].images.length ? (
                              <Image
                                src={properties[currentPropertyIndex].images[currentImageIndex]}
                                alt={properties[currentPropertyIndex].title}
                                objectFit="cover"
                              />
                            ) : properties[currentPropertyIndex].videos && properties[currentPropertyIndex].videos.length > 0 ? (
                              <video
                                src={properties[currentPropertyIndex].videos[currentImageIndex - properties[currentPropertyIndex].images.length]}
                                controls
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <Box bg="gray.100" display="flex" alignItems="center" justifyContent="center">
                                <Building size={60} />
                              </Box>
                            )
                          ) : properties[currentPropertyIndex].videos && properties[currentPropertyIndex].videos.length > 0 ? (
                            <video
                              src={properties[currentPropertyIndex].videos[currentImageIndex]}
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
                        {((properties[currentPropertyIndex].images && properties[currentPropertyIndex].images.length > 0) ||
                          (properties[currentPropertyIndex].videos && properties[currentPropertyIndex].videos.length > 0)) && (
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
                                  (properties[currentPropertyIndex].images?.length || 0) +
                                  (properties[currentPropertyIndex].videos?.length || 0) - 1
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
                              {currentImageIndex + 1} / {(properties[currentPropertyIndex].images?.length || 0) + (properties[currentPropertyIndex].videos?.length || 0)}
                            </Text>
                          </>
                        )}
                      </Box>

                      {/* Property Details */}
                      <Box>
                        <Heading size="lg" mb={4}>{properties[currentPropertyIndex].title}</Heading>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500" mb={6}>
                          ₹{properties[currentPropertyIndex].priceBreakup}
                        </Text>
                        
                        <Grid templateColumns={["1fr", "repeat(2, 1fr)"]} gap={4} mb={6}>
                          {/* Essential Property Details */}
                          <Box>
                            <Text fontWeight="bold">Property Type</Text>
                            <Text textTransform="capitalize">{properties[currentPropertyIndex].propertyType || 'N/A'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Property Subtype</Text>
                            <Text textTransform="capitalize">{properties[currentPropertyIndex].propertySubtype || 'N/A'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Property Choice</Text>
                            <Text textTransform="capitalize">{properties[currentPropertyIndex].propertyChoice?.replace(/([A-Z])/g, ' $1') || 'N/A'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Carpet Area</Text>
                            <Text>
                              {properties[currentPropertyIndex].carpetArea 
                                ? `${properties[currentPropertyIndex].carpetArea} ${properties[currentPropertyIndex].carpetAreaUnit?.toUpperCase() || 'SQFT'}`
                                : 'N/A'
                              }
                            </Text>
                          </Box>

                          {/* Location */}
                          <Box>
                            <Text fontWeight="bold">Location</Text>
                            <Text textTransform="capitalize">{properties[currentPropertyIndex].location || 'N/A'}</Text>
                          </Box>
                          {properties[currentPropertyIndex].landmark && (
                            <Box>
                              <Text fontWeight="bold">Landmark</Text>
                              <Text>{properties[currentPropertyIndex].landmark}</Text>
                            </Box>
                          )}

                          {/* Ownership Details */}
                          <Box>
                            <Text fontWeight="bold">Type of Ownership</Text>
                            <Text textTransform="capitalize">{properties[currentPropertyIndex].typeOfOwnership || 'N/A'}</Text>
                          </Box>
                          {properties[currentPropertyIndex].loanAvailable === 'yes' && (
                            <Box>
                              <Text fontWeight="bold">Bank Name</Text>
                              <Text>{properties[currentPropertyIndex].bankName || 'N/A'}</Text>
                            </Box>
                          )}
                          {properties[currentPropertyIndex].reraApproved === 'yes' && (
                            <Box>
                              <Text fontWeight="bold">RERA Number</Text>
                              <Text>{properties[currentPropertyIndex].reraNumber}</Text>
                            </Box>
                          )}

                          {/* Property Features */}
                          {properties[currentPropertyIndex].bedrooms && (
                            <Box>
                              <Text fontWeight="bold">Bedrooms</Text>
                              <Text>{properties[currentPropertyIndex].bedrooms}</Text>
                            </Box>
                          )}
                          {properties[currentPropertyIndex].bathrooms && (
                            <Box>
                              <Text fontWeight="bold">Bathrooms</Text>
                              <Text>{properties[currentPropertyIndex].bathrooms}</Text>
                            </Box>
                          )}
                          {properties[currentPropertyIndex].facing && (
                            <Box>
                              <Text fontWeight="bold">Facing</Text>
                              <Text textTransform="capitalize">{properties[currentPropertyIndex].facing}</Text>
                            </Box>
                          )}
                          {properties[currentPropertyIndex].amenities && (
                            <Box>
                              <Text fontWeight="bold">Amenities</Text>
                              <Text>{properties[currentPropertyIndex].amenities}</Text>
                            </Box>
                          )}

                          {/* Contact Details */}
                          <Box>
                            <Text fontWeight="bold">Owner Name</Text>
                            <Text>{properties[currentPropertyIndex].ownerName || 'N/A'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Owner Contact</Text>
                            <Text>{properties[currentPropertyIndex].ownerContactNo || 'N/A'}</Text>
                          </Box>
                        </Grid>

                        {/* Description */}
                        {properties[currentPropertyIndex].description && (
                          <Box mb={6}>
                            <Text fontWeight="bold" mb={2}>Description</Text>
                            <Text>{properties[currentPropertyIndex].description}</Text>
                          </Box>
                        )}

                        {/* Action Buttons */}
                        <Flex gap={2}>
                          <Button
                            leftIcon={<Edit2 size={16} />}
                            colorScheme="blue"
                            onClick={() => handleEditProperty(properties[currentPropertyIndex])}
                            flex="1"
                          >
                            Edit
                          </Button>
                          <Button
                            leftIcon={<Trash2 size={16} />}
                            colorScheme="red"
                            onClick={(e) => handleDeleteClick(properties[currentPropertyIndex], e)}
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
              {properties.length > 0 && (
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
                    Property {currentPropertyIndex + 1} of {properties.length}
                  </Text>
                  <Button
                    rightIcon={<ChevronRight size={20} />}
                    onClick={handleNextProperty}
                    isDisabled={currentPropertyIndex === properties.length - 1}
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