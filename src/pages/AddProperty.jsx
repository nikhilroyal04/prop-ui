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
import { createProperty, updateProperty, selectSelectedProperty, fetchPropertyById } from '../app/features/propertySlice';

const initialFormState = {
  // Basic Property Details
  title: '',
  description: '',
  propertyType: '',
  propertySubtype: '',
  propertyStatus: '',
  currentStatus: '',
  transactionType: '', // Buy or Rent
  carpetArea: '',
  carpetAreaUnit: 'sqft',
  ageOfConstruction: '',

  // Location Details
  location: '',
  landmark: '',
  googleMapsUrl: '',

  // Pricing & Ownership
  rate: '', // Renamed from priceBreakup
  loanAvailable: 'no',
  bankName: '',
  reraApproved: 'no',
  reraNumber: '',

  // Property Specifications
  bedrooms: '',
  bathrooms: '',
  additionalRooms: '',
  floors: '',
  facing: '',
  amenities: '',

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
  connectivity: '',
};

export default function AddProperty() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const property = useSelector(selectSelectedProperty);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const isEditing = location.pathname.includes('/edit/');

  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchPropertyById(id));
    }
  }, [dispatch, id, isEditing]);

  useEffect(() => {
    if (isEditing && id && property) {
      setFormData({
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
        balconies: property.balconies || '',
        parking: property.parking || '',
        furnishing: property.furnishing || '',
        facing: property.facing || '',
        floor: property.floor || '',
        totalFloors: property.totalFloors || '',
        amenities: property.amenities || [],
      });
      
      // Set images and videos if they exist
      if (property.images && property.images.length > 0) {
        setImages(property.images);
      }
      
      if (property.videos && property.videos.length > 0) {
        setVideos(property.videos);
      }
    } else if (isEditing && !property) {
      toast({
        title: 'Property not found',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/properties');
    }
  }, [isEditing, id, property, navigate, toast]);

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
        if (key !== 'images' && key !== 'videos') {
          propertyData.append(key, formData[key]);
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
        await dispatch(updateProperty(id, propertyData)).unwrap();
        toast({
          title: 'Property updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await dispatch(createProperty(propertyData)).unwrap();
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
        <SimpleGrid columns={[2, 3, 4]} spacing={4} mb={4}>
          {images.map((url, index) => (
            <Box key={index} position="relative">
              <AspectRatio ratio={4 / 3}>
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
              <Text
                position="absolute"
                bottom={1}
                right={1}
                bg="blackAlpha.600"
                color="white"
                px={2}
                py={1}
                borderRadius="md"
                fontSize="xs"
              >
                {index + 1}
              </Text>
            </Box>
          ))}
          {images.length < 10 && (
            <AspectRatio ratio={4 / 3}>
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

        <SimpleGrid columns={[1, 2]} spacing={4} mb={4}>
          {videos.map((url, index) => (
            <Box key={index} position="relative">
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
                icon={<X size={16} />}
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
                px={2}
                py={1}
                borderRadius="md"
                fontSize="xs"
              >
                {index + 1}
              </Text>
            </Box>
          ))}
          {videos.length < 5 && (
            <AspectRatio ratio={16 / 9}>
              <Button
                onClick={() => videoInputRef.current?.click()}
                w="full"
                h="full"
                variant="outline"
                leftIcon={<Plus size={20} />}
              >
                Add Videos
              </Button>
            </AspectRatio>
          )}
        </SimpleGrid>
      </Box>
    </FormControl>
  );

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
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter property title"
                        size="lg"
                        bg="white"
                        _hover={{ borderColor: 'blue.400' }}
                      />
                    ), true)}
                  </GridItem>

                  <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter property description"
                        rows={4}
                        bg="white"
                        _hover={{ borderColor: 'blue.400' }}
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel>Listing Type</FormLabel>
                      <Select
                        name="transactionType"
                        value={formData.transactionType}
                        onChange={handleInputChange}
                        bg="white"
                        _hover={{ borderColor: 'blue.400' }}
                      >
                        <option value="">Select Listing Type</option>
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                        <option value="lease">For Lease</option>
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
                        <option value="pending">Pending</option>
                      </Select>
                    </FormControl>
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
                      <FormLabel>Carpet Area</FormLabel>
                      <Flex gap={2}>
                        <Input
                          name="carpetArea"
                          value={formData.carpetArea}
                          onChange={handleInputChange}
                          type="number"
                          placeholder="Enter area"
                          flex="1"
                          bg="white"
                          _hover={{ borderColor: 'blue.400' }}
                        />
                        <Select
                          name="carpetAreaUnit"
                          value={formData.carpetAreaUnit}
                          onChange={handleInputChange}
                          width="120px"
                          bg="white"
                          _hover={{ borderColor: 'blue.400' }}
                        >
                          <option value="sqft">Sq. Ft.</option>
                          <option value="sqyd">Sq. Yd.</option>
                          <option value="sqm">Sq. M.</option>
                          <option value="acre">Acre</option>
                        </Select>
                      </Flex>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Age of Construction</FormLabel>
                      <Input
                        name="ageOfConstruction"
                        value={formData.ageOfConstruction}
                        onChange={handleInputChange}
                        placeholder="e.g., 2 years"
                        bg="white"
                        _hover={{ borderColor: 'blue.400' }}
                      />
                    </FormControl>
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
                    <FormControl>
                      <FormLabel>Google Maps URL</FormLabel>
                      <Input
                        name="googleMapsUrl"
                        value={formData.googleMapsUrl}
                        onChange={handleInputChange}
                        placeholder="Enter Google Maps URL"
                        bg="white"
                        _hover={{ borderColor: 'green.400' }}
                      />
                    </FormControl>
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
                    <FormControl>
                      <FormLabel>Bedrooms</FormLabel>
                      <Input
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        type="number"
                        placeholder="No. of bedrooms"
                        bg="white"
                        _hover={{ borderColor: 'orange.400' }}
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Bathrooms</FormLabel>
                      <Input
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        type="number"
                        placeholder="No. of bathrooms"
                        bg="white"
                        _hover={{ borderColor: 'orange.400' }}
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Additional Rooms</FormLabel>
                      <Input
                        name="additionalRooms"
                        value={formData.additionalRooms}
                        onChange={handleInputChange}
                        placeholder="e.g., Study, Pooja Room"
                        bg="white"
                        _hover={{ borderColor: 'orange.400' }}
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Floors</FormLabel>
                      <Flex gap={2} align="center">
                        <Input
                          name="currentFloor"
                          value={formData.currentFloor || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, currentFloor: e.target.value }))}
                          type="number"
                          placeholder="Current"
                          width="100px"
                          bg="white"
                          _hover={{ borderColor: 'orange.400' }}
                        />
                        <Text>out of</Text>
                        <Input
                          name="totalFloors"
                          value={formData.totalFloors || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, totalFloors: e.target.value }))}
                          type="number"
                          placeholder="Total"
                          width="100px"
                          bg="white"
                          _hover={{ borderColor: 'orange.400' }}
                        />
                      </Flex>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Facing</FormLabel>
                      <Select
                        name="facing"
                        value={formData.facing}
                        onChange={handleInputChange}
                        bg="white"
                        _hover={{ borderColor: 'orange.400' }}
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
                    </FormControl>
                  </GridItem>

                  <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
                    <FormControl>
                      <FormLabel>Amenities</FormLabel>
                      <Textarea
                        name="amenities"
                        value={formData.amenities}
                        onChange={handleInputChange}
                        placeholder="Enter amenities (e.g., Swimming Pool, Gym, Park, Security)"
                        rows={4}
                        bg="white"
                        _hover={{ borderColor: 'orange.400' }}
                      />
                    </FormControl>
                  </GridItem>
                </Grid>
              </Box>

              {/* 5. Developer & Project Information */}
              <Box>
                <Heading size="md" mb={4} color="teal.600">Developer & Project Information</Heading>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Developer</FormLabel>
                      <Input
                        name="developer"
                        value={formData.developer}
                        onChange={handleInputChange}
                        placeholder="Enter developer name"
                        bg="white"
                        _hover={{ borderColor: 'teal.400' }}
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Project Name</FormLabel>
                      <Input
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleInputChange}
                        placeholder="Enter project name"
                        bg="white"
                        _hover={{ borderColor: 'teal.400' }}
                      />
                    </FormControl>
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
                      />
                    ), true)}
                  </GridItem>

                  <GridItem>
                    {renderFormControl('ownerContactNo', 'Owner Contact No.', (
                      <Input
                        name="ownerContactNo"
                        value={formData.ownerContactNo}
                        onChange={handleInputChange}
                        type="tel"
                        placeholder="Enter contact number"
                        bg="white"
                        _hover={{ borderColor: 'red.400' }}
                      />
                    ), true)}
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Owner Email</FormLabel>
                      <Input
                        name="ownerEmail"
                        value={formData.ownerEmail}
                        onChange={handleInputChange}
                        type="email"
                        placeholder="Enter email address"
                        bg="white"
                        _hover={{ borderColor: 'red.400' }}
                      />
                    </FormControl>
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
                    <FormControl>
                      <FormLabel>Connectivity</FormLabel>
                      <Textarea
                        name="connectivity"
                        value={formData.connectivity}
                        onChange={handleInputChange}
                        placeholder="Describe the connectivity details..."
                        rows={4}
                        bg="white"
                        _hover={{ borderColor: 'pink.400' }}
                      />
                    </FormControl>
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