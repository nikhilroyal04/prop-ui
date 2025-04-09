import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Heading,
  Text,
  Flex,
  IconButton,
  SimpleGrid,
  AspectRatio,
  Image,
  Textarea,
  Grid,
  GridItem,
  useToast,
  FormErrorMessage,
  Card,
  CardBody,
  Divider,
  HStack,
} from '@chakra-ui/react';
import { X, Plus, ArrowLeft } from 'lucide-react';
import { createProperty, updateProperty, selectSelectedProperty, fetchPropertyById, selectLoading, selectError } from '../app/features/propertySlice';

const initialFormState = {
  // Basic Property Details
  title: '',
  description: '',
  propertyType: '',
  propertySubtype: '',
  propertyStatus: '',
  currentStatus: '',
  transactionType: '',
  carpetArea: '',
  carpetAreaUnit: 'sqft',
  ageOfConstruction: '',

  // Location Details
  location: '',
  landmark: '',
  googleMapsUrl: '',

  // Pricing & Ownership
  rate: '',
  loanAvailable: 'no',
  bankName: '',
  reraApproved: 'no',
  reraNumber: '',

  // Property Specifications
  bedrooms: '',
  bathrooms: '',
  additionalRooms: '',
  currentFloor: '',
  totalFloors: '',
  facing: '',
  amenities: [],
  balconies: '',
  parking: '',
  furnishing: '',

  // Developer & Project Information
  developer: '',
  projectName: '',

  // Owner / Seller Details
  ownerName: '',
  ownerContactNo: '',
  ownerEmail: '',

  // Media & Connectivity
  images: [],
  videos: [],
  connectivity: [],
};

const propertySuggestions = [
  { title: '1 BHK Flat', bedrooms: '1', bathrooms: '1', propertyType: 'residential', propertySubtype: 'apartment' },
  { title: '2 BHK Flat', bedrooms: '2', bathrooms: '2', propertyType: 'residential', propertySubtype: 'apartment' },
  { title: '3 BHK Flat', bedrooms: '3', bathrooms: '3', propertyType: 'residential', propertySubtype: 'apartment' },
  { title: '4 BHK Flat', bedrooms: '4', bathrooms: '4', propertyType: 'residential', propertySubtype: 'apartment' },
  { title: 'Studio Apartment', bedrooms: '1', bathrooms: '1', propertyType: 'residential', propertySubtype: 'studio' },
  { title: 'Independent House', bedrooms: '3', bathrooms: '3', propertyType: 'residential', propertySubtype: 'house' },
  { title: 'Office Space', bedrooms: '0', bathrooms: '2', propertyType: 'commercial', propertySubtype: 'office' },
  { title: 'Agricultural Land', bedrooms: '0', bathrooms: '0', propertyType: 'agricultural', propertySubtype: 'agriculturalPlot' },
];

export default function AddProperty() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast({
    position: 'top-right',
    duration: 3000,
    isClosable: true,
  });
  const property = useSelector(selectSelectedProperty);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  
  // Initialize form data based on whether we're editing or creating
  const isEditing = location.pathname.includes('/edit/');
  
  // Create a function to get initial form data
  const getInitialFormData = () => {
    if (isEditing && property) {
      // Parse existing ageOfConstruction if it exists
      let ageYears = '';
      let ageMonths = '';
      
      if (property.ageOfConstruction) {
        // Try to extract years and months from the existing format
        const ageMatch = property.ageOfConstruction.match(/(\d+)\s*years?\s*(?:,?\s*(\d+)\s*months?)?/i);
        if (ageMatch) {
          ageYears = ageMatch[1] || '';
          ageMonths = ageMatch[2] || '';
        } else {
          // If it doesn't match the pattern, just keep as is in years field
          ageYears = property.ageOfConstruction;
        }
      }
      
      return {
        ...initialFormState,
        ...property,
        // Ensure all required fields are present
        title: property.title || '',
        description: property.description || '',
        propertyType: property.propertyType || '',
        propertySubtype: property.propertySubtype || '',
        propertyStatus: property.propertyStatus || '',
        currentStatus: property.currentStatus || '',
        transactionType: property.transactionType || '',
        carpetArea: property.carpetArea || '',
        carpetAreaUnit: property.carpetAreaUnit || 'sqft',
        ageOfConstruction: property.ageOfConstruction || '',
        location: property.location || '',
        landmark: property.landmark || '',
        googleMapsUrl: property.googleMapsUrl || '',
        rate: property.rate || '',
        loanAvailable: property.loanAvailable || 'no',
        bankName: property.bankName || '',
        reraApproved: property.reraApproved || 'no',
        reraNumber: property.reraNumber || '',
        bedrooms: property.bedrooms || '',
        bathrooms: property.bathrooms || '',
        additionalRooms: property.additionalRooms || '',
        currentFloor: property.currentFloor || '',
        totalFloors: property.totalFloors || '',
        facing: property.facing || '',
        amenities: Array.isArray(property.amenities) ? property.amenities : 
                  (typeof property.amenities === 'string' ? property.amenities.split(',').map(item => item.trim()) : []),
        balconies: property.balconies || '',
        parking: property.parking || '',
        furnishing: property.furnishing || '',
        developer: property.developer || '',
        projectName: property.projectName || '',
        ownerName: property.ownerName || '',
        ownerContactNo: property.ownerContactNo || '',
        ownerEmail: property.ownerEmail || '',
        connectivity: Array.isArray(property.connectivity) ? property.connectivity : 
                     (typeof property.connectivity === 'string' ? property.connectivity.split(',').map(item => item.trim()) : []),
        priceBreakup: property.priceBreakup || '',
        // Keep existing images and videos
        images: property.images || [],
        videos: property.videos || [],
      };
    }
    return initialFormState;
  };
  
  // Initialize state with the appropriate data
  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize images and videos based on property data
  const getInitialImages = () => {
    if (isEditing && property && property.images && property.images.length > 0) {
      return property.images;
    }
    return [];
  };
  
  const getInitialVideos = () => {
    if (isEditing && property && property.videos && property.videos.length > 0) {
      return property.videos;
    }
    return [];
  };
  
  const [images, setImages] = useState(getInitialImages());
  const [videos, setVideos] = useState(getInitialVideos());
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Fetch property data if editing
  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchPropertyById(id));
    }
  }, [dispatch, id, isEditing]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/properties');
    }
  }, [error, navigate, toast]);

  // Update form data when property data changes
  useEffect(() => {
    if (isEditing && id && property) {
      setFormData({
        ...initialFormState,
        ...property,
        // Ensure all required fields are present
        title: property.title || '',
        description: property.description || '',
        propertyType: property.propertyType || '',
        propertySubtype: property.propertySubtype || '',
        propertyStatus: property.propertyStatus || '',
        currentStatus: property.currentStatus || '',
        transactionType: property.transactionType || '',
        carpetArea: property.carpetArea || '',
        carpetAreaUnit: property.carpetAreaUnit || 'sqft',
        ageOfConstruction: property.ageOfConstruction || '',
        location: property.location || '',
        landmark: property.landmark || '',
        googleMapsUrl: property.googleMapsUrl || '',
        rate: property.rate || '',
        loanAvailable: property.loanAvailable || 'no',
        bankName: property.bankName || '',
        reraApproved: property.reraApproved || 'no',
        reraNumber: property.reraNumber || '',
        bedrooms: property.bedrooms || '',
        bathrooms: property.bathrooms || '',
        additionalRooms: property.additionalRooms || '',
        currentFloor: property.currentFloor || '',
        totalFloors: property.totalFloors || '',
        facing: property.facing || '',
        amenities: Array.isArray(property.amenities) ? property.amenities : 
                  (typeof property.amenities === 'string' ? property.amenities.split(',').map(item => item.trim()) : []),
        balconies: property.balconies || '',
        parking: property.parking || '',
        furnishing: property.furnishing || '',
        developer: property.developer || '',
        projectName: property.projectName || '',
        ownerName: property.ownerName || '',
        ownerContactNo: property.ownerContactNo || '',
        ownerEmail: property.ownerEmail || '',
        connectivity: Array.isArray(property.connectivity) ? property.connectivity : 
                     (typeof property.connectivity === 'string' ? property.connectivity.split(',').map(item => item.trim()) : []),
        priceBreakup: property.priceBreakup || '',
        // Keep existing images and videos
        images: property.images || [],
        videos: property.videos || [],
      });
      
      // Set images and videos if they exist
      if (property.images && property.images.length > 0) {
        setImages(property.images);
      }
      
      if (property.videos && property.videos.length > 0) {
        setVideos(property.videos);
      }
    }
  }, [isEditing, id, property]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...formData.images];
    const newPreviewUrls = [...images];

    if (newImages.length + files.length > 10) {
      toast({
        title: "Upload limit exceeded",
        description: "You can only upload up to 10 images",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        newImages.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviewUrls.push(reader.result);
          setImages([...newPreviewUrls]);
        };
        reader.readAsDataURL(file);
      }
    });

    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleVideoSelect = (e) => {
    const files = Array.from(e.target.files);
    const newVideos = [...formData.videos];
    const newPreviewUrls = [...videos];

    if (newVideos.length + files.length > 5) {
      toast({
        title: "Upload limit exceeded",
        description: "You can only upload up to 5 videos",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    files.forEach(file => {
      if (file.type.startsWith('video/')) {
        newVideos.push(file);
        const url = URL.createObjectURL(file);
        newPreviewUrls.push(url);
      }
    });

    setFormData(prev => ({
      ...prev,
      videos: newVideos
    }));
    setVideos(newPreviewUrls);
  };

  const handleVideoUrlAdd = () => {
    const videoUrl = formData.tempVideoUrl;
    if (!videoUrl) return;

    if (formData.videos.length >= 5) {
      toast({
        title: "Upload limit exceeded",
        description: "You can only add up to 5 videos",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const newVideos = [...formData.videos, videoUrl];
    const newPreviewUrls = [...videos, videoUrl];

    setFormData(prev => ({
      ...prev,
      videos: newVideos,
      tempVideoUrl: ''
    }));
    setVideos(newPreviewUrls);
  };

  const handleRemoveImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviewUrls = images.filter((_, i) => i !== index);

    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
    setImages(newPreviewUrls);
  };

  const handleRemoveVideo = (index) => {
    const newVideos = formData.videos.filter((_, i) => i !== index);
    const newPreviewUrls = videos.filter((_, i) => i !== index);

    setFormData(prev => ({
      ...prev,
      videos: newVideos
    }));
    setVideos(newPreviewUrls);
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      title: suggestion.title,
      bedrooms: suggestion.bedrooms,
      bathrooms: suggestion.bathrooms,
      propertyType: suggestion.propertyType,
      propertySubtype: suggestion.propertySubtype,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.rate) newErrors.rate = 'Rate is required';
    if (!formData.ownerName) newErrors.ownerName = 'Owner name is required';
    if (!formData.ownerContactNo) newErrors.ownerContactNo = 'Owner contact number is required';
    
    // Email validation if provided
    if (formData.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
      newErrors.ownerEmail = 'Invalid email format';
    }
    
    // Phone number validation
    if (formData.ownerContactNo && !/^[0-9]{10}$/.test(formData.ownerContactNo)) {
      newErrors.ownerContactNo = 'Phone number must be 10 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const renderFormControl = (name, label, children, isRequired = false) => (
    <FormControl isInvalid={errors[name]} isRequired={isRequired}>
      <FormLabel>{label}</FormLabel>
      {children}
      {errors[name] && <FormErrorMessage>{errors[name]}</FormErrorMessage>}
    </FormControl>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare data for submission
      const propertyData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'images' && key !== 'videos' && key !== 'tempVideoUrl') {
          // Handle arrays by converting to JSON string
          if (Array.isArray(formData[key])) {
            propertyData.append(key, (formData[key]));
          } else {
            propertyData.append(key, formData[key]);
          }
        }
      });
      
      // Append images
      formData.images.forEach((image, index) => {
        propertyData.append(`images`, image);
      });
      
      // Append videos
      formData.videos.forEach((video, index) => {
        propertyData.append(`videos`, video);
      });
      
      if (isEditing) {
        await dispatch(updateProperty(id, propertyData));
        toast({
          title: 'Property updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await dispatch(createProperty(propertyData));
        toast({
          title: 'Property added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Navigate back to properties list
      navigate('/properties');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageUploadSection = (
    <FormControl>
      <FormLabel>Images (Max 10)</FormLabel>
      <Input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        display="none"
        ref={fileInputRef}
      />
      <Box borderWidth={1} borderRadius="md" p={4}>
        <SimpleGrid columns={[2, 4, 6]} spacing={3} mb={4}>
          {images?.map((url, index) => (
            <Box key={index} position="relative" maxW="150px">
              <AspectRatio ratio={4 / 3}>
                <Image
                  src={url}
                  alt={`Property image ${index + 1}`}
                  objectFit="cover"
                  borderRadius="md"
                />
              </AspectRatio>
              <IconButton
                icon={<X size={14} />}
                size="xs"
                colorScheme="red"
                position="absolute"
                top={1}
                right={1}
                onClick={() => handleRemoveImage(index)}
                aria-label="Remove image"
              />
              <Text
                position="absolute"
                bottom={1}
                right={1}
                bg="blackAlpha.600"
                color="white"
                px={1.5}
                py={0.5}
                borderRadius="md"
                fontSize="xs"
              >
                {index + 1}
              </Text>
            </Box>
          ))}
          {images.length < 10 && (
            <Box maxW="150px">
              <AspectRatio ratio={4 / 3}>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  w="full"
                  h="full"
                  variant="outline"
                  leftIcon={<Plus size={16} />}
                  fontSize="sm"
                >
                  Add Image
                </Button>
              </AspectRatio>
            </Box>
          )}
        </SimpleGrid>
        <Text fontSize="sm" color="gray.500">
          {images.length}/10 images uploaded. Click to add more images.
        </Text>
      </Box>
    </FormControl>
  );

  const videoUploadSection = (
    <FormControl>
      <FormLabel>Videos (Max 5)</FormLabel>
      <Input
        type="file"
        multiple
        accept="video/*"
        onChange={handleVideoSelect}
        display="none"
        ref={videoInputRef}
      />
      <Box borderWidth={1} borderRadius="md" p={4}>
        <Flex mb={4}>
          <Input
            placeholder="Enter video URL"
            value={formData.tempVideoUrl || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, tempVideoUrl: e.target.value }))}
            mr={2}
          />
          <Button onClick={handleVideoUrlAdd}>Add URL</Button>
        </Flex>

        <SimpleGrid columns={[2, 3, 4]} spacing={3} mb={4}>
          {videos?.map((url, index) => (
            <Box key={index} position="relative" maxW="200px">
              <AspectRatio ratio={16 / 9}>
                {typeof videos[index] === 'string' ? (
                  <iframe
                    src={url.replace('watch?v=', 'embed/')}
                    title={`Video ${index + 1}`}
                    allowFullScreen
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                ) : (
                  <video
                    src={url}
                    controls
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </AspectRatio>
              <IconButton
                icon={<X size={14} />}
                size="xs"
                colorScheme="red"
                position="absolute"
                top={1}
                right={1}
                onClick={() => handleRemoveVideo(index)}
                aria-label="Remove video"
              />
              <Text
                position="absolute"
                bottom={1}
                right={1}
                bg="blackAlpha.600"
                color="white"
                px={1.5}
                py={0.5}
                borderRadius="md"
                fontSize="xs"
              >
                {index + 1}
              </Text>
            </Box>
          ))}
          {videos.length < 5 && (
            <Box maxW="200px">
              <AspectRatio ratio={16 / 9}>
                <Button
                  onClick={() => videoInputRef.current?.click()}
                  w="full"
                  h="full"
                  variant="outline"
                  leftIcon={<Plus size={16} />}
                  fontSize="sm"
                >
                  Add Video
                </Button>
              </AspectRatio>
            </Box>
          )}
        </SimpleGrid>
      </Box>
    </FormControl>
  );

  // Show loading state
  if (loading && isEditing) {
    return (
      <Box p={6} display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Text>Loading property details...</Text>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box p={6} display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Text color="red.500">Error: {error}</Text>
      </Box>
    );
  }


  return (
    <Box p={4}>
      <Button
        leftIcon={<ArrowLeft />}
        variant="ghost"
        mb={4}
        onClick={() => navigate('/properties')}
      >
        Back to Properties
      </Button>
      
      <Card>
        <CardBody>
          <Heading size="lg" mb={6}>
            {isEditing ? 'Edit Property' : 'Add New Property'}
          </Heading>
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={8} align="stretch">
              {/* 1. Basic Property Details */}
              <Box>
                <Heading size="md" mb={4} color="blue.600">Basic Property Details</Heading>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                  <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
                    {renderFormControl('title', 'Property Title', (
                      <>
                        <Input
                          name="title"
                          value={formData.title || ''}
                          onChange={handleInputChange}
                          placeholder="Enter property title"
                          size="lg"
                          bg="white"
                          _hover={{ borderColor: 'blue.400' }}
                        />
                        <Box mt={2}>
                          <Text fontSize="sm" color="gray.600" mb={2}>Quick Select:</Text>
                          <Flex gap={2} flexWrap="wrap" maxW="100%" overflowX="hidden">
                            {propertySuggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                size="sm"
                                variant="outline"
                                colorScheme="blue"
                                onClick={() => handleSuggestionClick(suggestion)}
                                _hover={{ bg: 'blue.50' }}
                                whiteSpace="nowrap"
                                minW="auto"
                                px={3}
                              >
                                {suggestion.title}
                              </Button>
                            ))}
                          </Flex>
                        </Box>
                      </>
                    ), true)}
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Property Type</FormLabel>
                      <Select
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={handleInputChange}
                        bg="white"
                        _hover={{ borderColor: 'blue.400' }}
                      >
                        <option value="">Select Property Type</option>
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
                        value={formData.propertySubtype}
                        onChange={handleInputChange}
                        bg="white"
                        _hover={{ borderColor: 'blue.400' }}
                      >
                        <option value="">Select Subtype</option>
                        {formData.propertyType === 'residential' && (
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
                        {formData.propertyType === 'commercial' && (
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
                        {formData.propertyType === 'industrial' && (
                          <>
                            <option value="factory">Factory</option>
                            <option value="industrialPlot">Industrial Plot</option>
                            <option value="industrialShed">Industrial Shed</option>
                            <option value="warehouse">Warehouse</option>
                          </>
                        )}
                        {formData.propertyType === 'agricultural' && (
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
                      <FormLabel>Property Status</FormLabel>
                      <Select
                        name="propertyStatus"
                        value={formData.propertyStatus}
                        onChange={handleInputChange}
                        bg="white"
                        _hover={{ borderColor: 'blue.400' }}
                      >
                        <option value="">Select Status</option>
                        <option value="ready">Ready to Move</option>
                        <option value="underConstruction">Under Construction</option>
                        <option value="newLaunch">New Launch</option>
                        <option value="resale">Resale</option>
                      </Select>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Current Status</FormLabel>
                      <Select
                        name="currentStatus"
                        value={formData.currentStatus}
                        onChange={handleInputChange}
                        bg="white"
                        _hover={{ borderColor: 'blue.400' }}
                      >
                        <option value="">Select Current Status</option>
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                        <option value="rented">Rented</option>
                        <option value="reserved">Reserved</option>
                      </Select>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Transaction Type</FormLabel>
                      <Select
                        name="transactionType"
                        value={formData.transactionType}
                        onChange={handleInputChange}
                        bg="white"
                        _hover={{ borderColor: 'blue.400' }}
                      >
                        <option value="">Select Transaction Type</option>
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                        <option value="lease">For Lease</option>
                      </Select>
                    </FormControl>
                  </GridItem>

                  <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
                    {renderFormControl('description', 'Description', (
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter property description"
                        rows={4}
                        bg="white"
                        _hover={{ borderColor: 'blue.400' }}
                      />
                    ))}
                  </GridItem>
                </Grid>
              </Box>

              {/* 2. Location Details */}
              <Box>
                <Heading size="md" mb={4} color="green.600">Location Details</Heading>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    {renderFormControl('location', 'Location', (
                      <Input
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Enter property location"
                        bg="white"
                        _hover={{ borderColor: 'green.400' }}
                      />
                    ), true)}
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Landmark</FormLabel>
                      <Input
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleInputChange}
                        placeholder="Enter nearby landmark"
                        bg="white"
                        _hover={{ borderColor: 'green.400' }}
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
                    {renderFormControl('googleMapsUrl', 'Google Maps URL', (
                      <Input
                        name="googleMapsUrl"
                        value={formData.googleMapsUrl}
                        onChange={handleInputChange}
                        placeholder="Enter Google Maps URL"
                        bg="white"
                        _hover={{ borderColor: 'green.400' }}
                      />
                    ))}
                  </GridItem>
                </Grid>
              </Box>

              {/* 3. Pricing & Ownership */}
              <Box>
                <Heading size="md" mb={4} color="purple.600">Pricing & Ownership</Heading>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                  <GridItem>
                    {renderFormControl('rate', 'Rate', (
                      <Input
                        name="rate"
                        value={formData.rate}
                        onChange={handleInputChange}
                        type="text"
                        placeholder="Enter rate"
                        bg="white"
                        _hover={{ borderColor: 'purple.400' }}
                      />
                    ), true)}
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Loan Available</FormLabel>
                      <Select
                        name="loanAvailable"
                        value={formData.loanAvailable}
                        onChange={handleInputChange}
                        bg="white"
                        _hover={{ borderColor: 'purple.400' }}
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </Select>
                    </FormControl>
                  </GridItem>

                  {formData.loanAvailable === 'yes' && (
                    <GridItem>
                      <FormControl>
                        <FormLabel>Bank Name</FormLabel>
                        <Input
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleInputChange}
                          placeholder="Enter bank name"
                          bg="white"
                          _hover={{ borderColor: 'purple.400' }}
                        />
                      </FormControl>
                    </GridItem>
                  )}

                  <GridItem>
                    <FormControl>
                      <FormLabel>RERA Approved</FormLabel>
                      <Select
                        name="reraApproved"
                        value={formData.reraApproved}
                        onChange={handleInputChange}
                        bg="white"
                        _hover={{ borderColor: 'purple.400' }}
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </Select>
                    </FormControl>
                  </GridItem>

                  {formData.reraApproved === 'yes' && (
                    <GridItem>
                      <FormControl>
                        <FormLabel>RERA Number</FormLabel>
                        <Input
                          name="reraNumber"
                          value={formData.reraNumber}
                          onChange={handleInputChange}
                          placeholder="Enter RERA number"
                          bg="white"
                          _hover={{ borderColor: 'purple.400' }}
                        />
                      </FormControl>
                    </GridItem>
                  )}
                </Grid>
              </Box>

              {/* 4. Property Specifications */}
              <Box>
                <Heading size="md" mb={4} color="orange.600">Property Specifications</Heading>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
                  <GridItem>
                    {renderFormControl('bedrooms', 'Bedrooms', (
                      <Input
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        type="number"
                        min="0"
                        placeholder="No. of bedrooms"
                        bg="white"
                        _hover={{ borderColor: 'orange.400' }}
                        isDisabled={isSubmitting}
                      />
                    ))}
                  </GridItem>

                  <GridItem>
                    {renderFormControl('bathrooms', 'Bathrooms', (
                      <Input
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        type="number"
                        min="0"
                        placeholder="No. of bathrooms"
                        bg="white"
                        _hover={{ borderColor: 'orange.400' }}
                        isDisabled={isSubmitting}
                      />
                    ))}
                  </GridItem>

                  <GridItem>
                    {renderFormControl('balconies', 'Balconies', (
                      <Input
                        name="balconies"
                        value={formData.balconies}
                        onChange={handleInputChange}
                        type="number"
                        min="0"
                        placeholder="No. of balconies"
                        bg="white"
                        _hover={{ borderColor: 'orange.400' }}
                        isDisabled={isSubmitting}
                      />
                    ))}
                  </GridItem>

                  <GridItem>
                    {renderFormControl('parking', 'Parking', (
                      <Input
                        name="parking"
                        value={formData.parking}
                        onChange={handleInputChange}
                        type="number"
                        min="0"
                        placeholder="No. of parking spots"
                        bg="white"
                        _hover={{ borderColor: 'orange.400' }}
                        isDisabled={isSubmitting}
                      />
                    ))}
                  </GridItem>

                  <GridItem>
                    {renderFormControl('furnishing', 'Furnishing', (
                      <Select
                        name="furnishing"
                        value={formData.furnishing}
                        onChange={handleInputChange}
                        bg="white"
                        _hover={{ borderColor: 'orange.400' }}
                        isDisabled={isSubmitting}
                      >
                        <option value="">Select Furnishing</option>
                        <option value="unfurnished">Unfurnished</option>
                        <option value="semi-furnished">Semi-Furnished</option>
                        <option value="fully-furnished">Fully-Furnished</option>
                      </Select>
                    ))}
                  </GridItem>

                  <GridItem>
                    {renderFormControl('facing', 'Facing', (
                      <Select
                        name="facing"
                        value={formData.facing}
                        onChange={handleInputChange}
                        bg="white"
                        _hover={{ borderColor: 'orange.400' }}
                        isDisabled={isSubmitting}
                      >
                        <option value="">Select Facing</option>
                        <option value="north">North</option>
                        <option value="north-east">North-East</option>
                        <option value="east">East</option>
                        <option value="south-east">South-East</option>
                        <option value="south">South</option>
                        <option value="south-west">South-West</option>
                        <option value="west">West</option>
                        <option value="north-west">North-West</option>
                      </Select>
                    ))}
                  </GridItem>

                  <GridItem>
                    {renderFormControl('floor', 'Floor', (
                      <Flex gap={2} align="center">
                        <Input
                          name="currentFloor"
                          value={formData.currentFloor}
                          onChange={handleInputChange}
                          type="number"
                          min="0"
                          placeholder="Current"
                          width="100px"
                          bg="white"
                          _hover={{ borderColor: 'orange.400' }}
                          isDisabled={isSubmitting}
                        />
                        <Text>of</Text>
                        <Input
                          name="totalFloors"
                          value={formData.totalFloors}
                          onChange={handleInputChange}
                          type="number"
                          min="1"
                          placeholder="Total"
                          width="100px"
                          bg="white"
                          _hover={{ borderColor: 'orange.400' }}
                          isDisabled={isSubmitting}
                        />
                      </Flex>
                    ))}
                  </GridItem>

                  <GridItem>
                    {renderFormControl('carpetArea', 'Carpet Area', (
                      <Flex gap={2}>
                        <Input
                          name="carpetArea"
                          value={formData.carpetArea}
                          onChange={handleInputChange}
                          type="number"
                          min="0"
                          placeholder="Enter area"
                          flex="1"
                          bg="white"
                          _hover={{ borderColor: 'orange.400' }}
                          isDisabled={isSubmitting}
                        />
                        <Select
                          name="carpetAreaUnit"
                          value={formData.carpetAreaUnit}
                          onChange={handleInputChange}
                          width="120px"
                          bg="white"
                          _hover={{ borderColor: 'orange.400' }}
                          isDisabled={isSubmitting}
                        >
                          <option value="sqft">Square Feet</option>
                          <option value="sqyd">Square Yard</option>
                          <option value="sqm">Square Meter</option>
                          <option value="acre">Acre</option>
                        </Select>
                      </Flex>
                    ))}
                  </GridItem>

                  <GridItem>
                    {renderFormControl('ageOfConstruction', 'Age of Construction', (
                      <Input
                        name="ageOfConstruction"
                        value={formData.ageOfConstruction}
                        onChange={handleInputChange}
                        placeholder="e.g., 4 years 6 months"
                        bg="white"
                        _hover={{ borderColor: 'orange.400' }}
                        isDisabled={isSubmitting}
                      />
                    ))}
                  </GridItem>

                  <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
                    {renderFormControl('additionalRooms', 'Additional Rooms', (
                      <Input
                        name="additionalRooms"
                        value={formData.additionalRooms}
                        onChange={handleInputChange}
                        placeholder="e.g., Study, Pooja Room"
                        bg="white"
                        _hover={{ borderColor: 'orange.400' }}
                        isDisabled={isSubmitting}
                      />
                    ))}
                  </GridItem>

                  <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
                    {renderFormControl('amenities', 'Amenities', (
                      <Textarea
                        name="amenities"
                        value={formData.amenities}
                        onChange={handleInputChange}
                        placeholder="Enter amenities (e.g., Swimming Pool, Gym, Park, Security)"
                        rows={4}
                        bg="white"
                        _hover={{ borderColor: 'orange.400' }}
                        isDisabled={isSubmitting}
                      />
                    ))}
                  </GridItem>
                </Grid>
              </Box>

              {/* 5. Developer & Project Information */}
              <Box>
                <Heading size="md" mb={4} color="teal.600">Developer & Project Information</Heading>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                  <GridItem>
                    {renderFormControl('developer', 'Developer', (
                      <Input
                        name="developer"
                        value={formData.developer}
                        onChange={handleInputChange}
                        placeholder="Enter developer name"
                        bg="white"
                        _hover={{ borderColor: 'teal.400' }}
                        isDisabled={isSubmitting}
                      />
                    ))}
                  </GridItem>

                  <GridItem>
                    {renderFormControl('projectName', 'Project Name', (
                      <Input
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleInputChange}
                        placeholder="Enter project name"
                        bg="white"
                        _hover={{ borderColor: 'teal.400' }}
                        isDisabled={isSubmitting}
                      />
                    ))}
                  </GridItem>
                </Grid>
              </Box>

              {/* 6. Owner / Seller Details */}
              <Box>
                <Heading size="md" mb={4} color="red.600">Owner / Seller Details</Heading>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                  <GridItem>
                    {renderFormControl('ownerName', 'Owner Name', (
                      <Input
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleInputChange}
                        placeholder="Enter owner name"
                        bg="white"
                        _hover={{ borderColor: 'red.400' }}
                        isDisabled={isSubmitting}
                      />
                    ), true)}
                  </GridItem>

                  <GridItem>
                    {renderFormControl('ownerContactNo', 'Owner Contact No.', (
                      <Input
                        name="ownerContactNo"
                        value={formData.ownerContactNo}
                        onChange={handleInputChange}
                        type="number"
                        placeholder="Enter contact number"
                        bg="white"
                        _hover={{ borderColor: 'red.400' }}
                        isDisabled={isSubmitting}
                      />
                    ), true)}
                  </GridItem>

                  <GridItem>
                    {renderFormControl('ownerEmail', 'Owner Email', (
                      <Input
                        name="ownerEmail"
                        value={formData.ownerEmail}
                        onChange={handleInputChange}
                        type="email"
                        placeholder="Enter email address"
                        bg="white"
                        _hover={{ borderColor: 'red.400' }}
                        isDisabled={isSubmitting}
                      />
                    ))}
                  </GridItem>
                </Grid>
              </Box>

              {/* 7. Media & Connectivity */}
              <Box>
                <Heading size="md" mb={4} color="pink.600">Media & Connectivity</Heading>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    {imageUploadSection}
                  </GridItem>
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    {videoUploadSection}
                  </GridItem>
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    {renderFormControl('connectivity', 'Connectivity', (
                      <Textarea
                        name="connectivity"
                        value={formData.connectivity}
                        onChange={handleInputChange}
                        placeholder="Describe the connectivity details..."
                        rows={4}
                        bg="white"
                        _hover={{ borderColor: 'pink.400' }}
                        isDisabled={isSubmitting}
                      />
                    ))}
                  </GridItem>
                </Grid>
              </Box>

              <Divider my={6} />
              
              <HStack spacing={4} justify="flex-end">
                <Button
                  variant="outline"
                  onClick={() => navigate('/properties')}
                  isDisabled={isSubmitting}
                  size="lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  loadingText={isEditing ? 'Updating...' : 'Adding...'}
                  size="lg"
                >
                  {isEditing ? 'Update Property' : 'Add Property'}
                </Button>
              </HStack>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
} 