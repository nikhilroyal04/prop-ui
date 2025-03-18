import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Building, Loader2, Edit2, Trash2, X, Image as ImageIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Grid,
  GridItem,
  Box,
  Card,
  CardBody,
  Text,
  Stack,
  Heading,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
  Flex,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  ButtonGroup,
  Image,
  SimpleGrid,
  AspectRatio,
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

const initialFormState = {
  title: '',
  price: '',
  location: '',
  landMark: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  images: [],
  description: '',
  societyName: '',
  propertyType: '',
  propertyStatus: '',
  propertyAge: '',
  propertyFacing: '',
};

const ITEMS_PER_PAGE = 10;

const properties = [
  {
    title: 'Luxury Villa in Bali',
    price: '500000',
    location: 'Bali, Indonesia',
    landMark: 'Near Ubud Monkey Forest',
    bedrooms: '4',
    bathrooms: '3',
    area: '2500 sq. ft.',
    images: [
      'https://dummyimage.com/600x400/000/fff&text=Image+1',
      'https://dummyimage.com/600x400/000/fff&text=Image+2',
      'https://dummyimage.com/600x400/000/fff&text=Image+3',
    ],
    description: 'A luxurious villa with a private pool, modern amenities, and stunning views of the Balinese landscape.',
    societyName: 'Bali Luxury Estates',
    propertyType: 'Villa',
    propertyStatus: 'For Sale',
    propertyAge: '5 years',
    propertyFacing: 'North',
  },
  {
    title: 'Modern Apartment in New York',
    price: '750000',
    location: 'New York, USA',
    landMark: 'Near Central Park',
    bedrooms: '3',
    bathrooms: '2',
    area: '1800 sq. ft.',
    images: [
      'https://dummyimage.com/600x400/000/fff&text=Image+4',
      'https://dummyimage.com/600x400/000/fff&text=Image+5',
      'https://dummyimage.com/600x400/000/fff&text=Image+6',
    ],
    description: 'A modern apartment in the heart of New York City, close to Central Park and major attractions.',
    societyName: 'Manhattan Heights',
    propertyType: 'Apartment',
    propertyStatus: 'For Sale',
    propertyAge: '2 years',
    propertyFacing: 'East',
  },
  {
    title: 'Beach House in Malibu',
    price: '1200000',
    location: 'Malibu, California',
    landMark: 'Near Malibu Beach',
    bedrooms: '5',
    bathrooms: '4',
    area: '3500 sq. ft.',
    images: [
      'https://dummyimage.com/600x400/000/fff&text=Image+7',
      'https://dummyimage.com/600x400/000/fff&text=Image+8',
      'https://dummyimage.com/600x400/000/fff&text=Image+9',
    ],
    description: 'A stunning beach house with ocean views, private beach access, and luxurious interiors.',
    societyName: 'Malibu Beach Residences',
    propertyType: 'Beach House',
    propertyStatus: 'For Sale',
    propertyAge: '10 years',
    propertyFacing: 'West',
  },
];

export default function Properties() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // const properties = useSelector(selectProperties);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef(null);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);

  // Calculate pagination
  const totalPages = Math.ceil((properties?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProperties = properties?.slice(startIndex, endIndex) || [];

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  // Update form when a property is selected
  useEffect(() => {
    if (selectedProperty) {
      setFormData({
        title: selectedProperty.title || '',
        price: selectedProperty.price || '',
        location: selectedProperty.location || '',
        landMark: selectedProperty.landMark || '',
        bedrooms: selectedProperty.bedrooms || '',
        bathrooms: selectedProperty.bathrooms || '',
        area: selectedProperty.area || '',
        images: selectedProperty.images || [],
        description: selectedProperty.description || '',
        societyName: selectedProperty.societyName || '',
        propertyType: selectedProperty.propertyType || '',
        propertyStatus: selectedProperty.propertyStatus || '',
        propertyAge: selectedProperty.propertyAge || '',
        propertyFacing: selectedProperty.propertyFacing || '',
      });
      // Set preview URLs if images exist
      setImagePreviewUrls(selectedProperty.images?.map(img => 
        typeof img === 'string' ? img : URL.createObjectURL(img)
      ) || []);
      setIsEditing(true);
    } else {
      setFormData(initialFormState);
      setImagePreviewUrls([]);
      setIsEditing(false);
    }
  }, [selectedProperty]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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
      handleReset();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteProperty(propertyToDelete.id));
      toast({
        title: "Property deleted",
        status: "success",
        duration: 3000,
      });
      if (selectedProperty?.id === propertyToDelete.id) {
        handleReset();
      }
      onClose();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleReset = () => {
    setSelectedProperty(null);
    setFormData(initialFormState);
    setImagePreviewUrls([]);
    setIsEditing(false);
  };

  const handleDeleteClick = (property, e) => {
    e.stopPropagation();
    setPropertyToDelete(property);
    onOpen();
  };

  // Add this function to handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...formData.images];
    const newPreviewUrls = [...imagePreviewUrls];

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        newImages.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviewUrls.push(reader.result);
          setImagePreviewUrls([...newPreviewUrls]);
        };
        reader.readAsDataURL(file);
      }
    });

    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  // Add this function to remove images
  const handleRemoveImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
    setImagePreviewUrls(newPreviewUrls);
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleNextImage = () => { 
    if (currentImageIndex < properties[currentPropertyIndex].images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };
  
  // Add this section in your form, after the other form controls
  const imageUploadSection = (
    <FormControl>
      <FormLabel>Property Images</FormLabel>
      <Input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        display="none"
        ref={fileInputRef}
      />
      <Box borderWidth={1} borderRadius="md" p={4}>
        <SimpleGrid columns={[2, 3, 4]} spacing={4} mb={4}>
          {imagePreviewUrls.map((url, index) => (
            <Box key={index} position="relative">
              <AspectRatio ratio={4/3}>
                <Image
                  src={url}
                  alt={`Property image ${index + 1}`}
                  objectFit="cover"
                  borderRadius="md"
                />
              </AspectRatio>
              <IconButton
                icon={<X size={16} />}
                size="xs"
                colorScheme="red"
                position="absolute"
                top={1}
                right={1}
                onClick={() => handleRemoveImage(index)}
                aria-label="Remove image"
              />
            </Box>
          ))}
          <AspectRatio ratio={4/3}>
            <Button
              onClick={() => fileInputRef.current?.click()}
              w="full"
              h="full"
              variant="outline"
              leftIcon={<Plus size={20} />}
            >
              Add Images
            </Button>
          </AspectRatio>
        </SimpleGrid>
        <Text fontSize="sm" color="gray.500">
          Click to add images. You can add multiple images at once.
        </Text>
      </Box>
    </FormControl>
  );

  const handleNextProperty = () => {
    if (currentPropertyIndex < properties.length - 1) {
      setCurrentPropertyIndex(prev => prev + 1);
      setCurrentImageIndex(0);
    }
  };

  const handlePreviousProperty = () => {
    if (currentPropertyIndex > 0) {
      setCurrentPropertyIndex(prev => prev - 1);
      setCurrentImageIndex(0);
    }
  };

  // Reset image index when property changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [currentPage]);

  if (loading) {
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
    <Box p={6}>
      <Grid templateColumns="repeat(2, 1fr)" gap={6} minH="calc(100vh - 140px)">
        {/* Left Side - Single Property View */}
        <GridItem>
          <Card height="full">
            <CardBody display="flex" flexDirection="column">
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">Properties ({properties?.length || 0})</Heading>
                <Text>
                  Property {currentPropertyIndex + 1} of {properties.length}
                </Text>
              </Flex>

              {properties.length > 0 && (
                <Box flex="1">
                  <Card variant="outline">
                    <CardBody>
                      {/* Image Carousel */}
                      <Box mb={4} position="relative" borderRadius="md" overflow="hidden">
                        <AspectRatio ratio={16/9}>
                          {properties[currentPropertyIndex].images && properties[currentPropertyIndex].images.length > 0 ? (
                            <Image
                              src={properties[currentPropertyIndex].images[currentImageIndex]}
                              alt={properties[currentPropertyIndex].title}
                              objectFit="cover"
                            />
                          ) : (
                            <Box bg="gray.100" display="flex" alignItems="center" justifyContent="center">
                              <Building size={60} />
                            </Box>
                          )}
                        </AspectRatio>
                        
                        {/* Image Navigation */}
                        {properties[currentPropertyIndex].images && properties[currentPropertyIndex].images.length > 1 && (
                          <>
                            <IconButton
                              icon={<ChevronLeft size={20} />}
                              position="absolute"
                              left={2}
                              top="50%"
                              transform="translateY(-50%)"
                              onClick={handlePrevImage}
                              colorScheme="blackAlpha"
                              aria-label="Previous image"
                              isRound
                              size="sm"
                            />
                            <IconButton
                              icon={<ChevronRight size={20} />}
                              position="absolute"
                              right={2}
                              top="50%"
                              transform="translateY(-50%)"
                              onClick={handleNextImage}
                              colorScheme="blackAlpha"
                              aria-label="Next image"
                              isRound
                              size="sm"
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
                              {currentImageIndex + 1} / {properties[currentPropertyIndex].images.length}
                            </Text>
                          </>
                        )}
                      </Box>

                      {/* Property Details */}
                      <VStack align="stretch" spacing={4}>
                        <Heading size="lg">{properties[currentPropertyIndex].title}</Heading>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                          ${properties[currentPropertyIndex].price}
                        </Text>
                        
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                          <Box>
                            <Text fontWeight="bold">Location</Text>
                            <Text>{properties[currentPropertyIndex].location}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Landmark</Text>
                            <Text>{properties[currentPropertyIndex].landMark}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Property Type</Text>
                            <Text>{properties[currentPropertyIndex].propertyType}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Status</Text>
                            <Text>{properties[currentPropertyIndex].propertyStatus}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Society</Text>
                            <Text>{properties[currentPropertyIndex].societyName}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Property Age</Text>
                            <Text>{properties[currentPropertyIndex].propertyAge}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Facing</Text>
                            <Text>{properties[currentPropertyIndex].propertyFacing}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Area</Text>
                            <Text>{properties[currentPropertyIndex].area}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Bedrooms</Text>
                            <Text>{properties[currentPropertyIndex].bedrooms}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Bathrooms</Text>
                            <Text>{properties[currentPropertyIndex].bathrooms}</Text>
                          </Box>
                        </Grid>

                        <Box>
                          <Text fontWeight="bold">Description</Text>
                          <Text>{properties[currentPropertyIndex].description}</Text>
                        </Box>

                        {/* Action Buttons */}
                        <Flex gap={2} mt={4}>
                          <Button
                            leftIcon={<Edit2 size={16} />}
                            colorScheme="blue"
                            onClick={() => handlePropertySelect(properties[currentPropertyIndex])}
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
                      </VStack>
                    </CardBody>
                  </Card>
                </Box>
              )}

              {/* Navigation Controls */}
              <Flex justify="space-between" align="center" mt={4}>
                <Button
                  leftIcon={<ChevronLeft size={20} />}
                  onClick={handlePreviousProperty}
                  isDisabled={currentPropertyIndex === 0}
                  size="lg"
                  variant="ghost"
                >
                  Previous Property
                </Button>
                <Text fontSize="sm" color="gray.600">
                  Property {currentPropertyIndex + 1} of {properties.length}
                </Text>
                <Button
                  rightIcon={<ChevronRight size={20} />}
                  onClick={handleNextProperty}
                  isDisabled={currentPropertyIndex === properties.length - 1}
                  size="lg"
                  variant="ghost"
                >
                  Next Property
                </Button>
              </Flex>
            </CardBody>
          </Card>
        </GridItem>

        {/* Right Side - Property Form */}
        <GridItem>
          <Card height="full">
            <CardBody>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">
                  {isEditing ? 'Edit Property' : 'Add New Property'}
                </Heading>
                {isEditing && (
                  <Button 
                    size="sm"
                    onClick={handleReset}
                  >
                    Cancel Edit
                  </Button>
                )}
              </Flex>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Property Title</FormLabel>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter property title"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Price</FormLabel>
                    <Input
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Enter price"
                      type="number"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Location</FormLabel>
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter location"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Property Type</FormLabel>
                    <Select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      placeholder="Select property type"
                    >
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                      <option value="condo">Condo</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Bedrooms</FormLabel>
                    <Input
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      placeholder="Number of bedrooms"
                      type="number"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Bathrooms</FormLabel>
                    <Input
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      placeholder="Number of bathrooms"
                      type="number"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Area (sqft)</FormLabel>
                    <Input
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      placeholder="Total area in square feet"
                      type="number"
                    />
                  </FormControl>

                  {imageUploadSection}

                  <Button type="submit" colorScheme="blue" width="full">
                    {isEditing ? 'Update Property' : 'Add Property'}
                  </Button>
                </VStack>
              </form>
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
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
} 