import { useState, useRef, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { X, Plus } from 'lucide-react';

const initialFormState = {
  // Basic Property Details
  title: '',
  description: '',
  propertyType: '',
  propertySubtype: '',
  propertyChoice: '',
  carpetArea: '',
  carpetAreaUnit: 'sqft',
  ageOfConstruction: '',

  // Location Details
  location: '',
  landmark: '',
  googleMapsUrl: '',

  // Pricing & Ownership
  priceBreakup: '',
  typeOfOwnership: '',
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

export default function AddProperty({ onSubmit, isEditing, initialData, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        ...initialFormState,
        ...initialData,
        images: initialData.images || [],
        videos: initialData.videos || [],
        carpetAreaUnit: initialData.carpetAreaUnit || 'sqft',
        loanAvailable: initialData.loanAvailable || 'no',
        reraApproved: initialData.reraApproved || 'no',
      };
    }
    return initialFormState;
  });

  const [imagePreviewUrls, setImagePreviewUrls] = useState(() => {
    if (initialData?.images && Array.isArray(initialData.images)) {
      return initialData.images.map(img =>
        typeof img === 'string' ? img : URL.createObjectURL(img)
      );
    }
    return [];
  });

  const [videoPreviewUrls, setVideoPreviewUrls] = useState(() => {
    if (initialData?.videos && Array.isArray(initialData.videos)) {
      return initialData.videos.map(video =>
        typeof video === 'string' ? video : URL.createObjectURL(video)
      );
    }
    return [];
  });

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

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
    const newPreviewUrls = [...imagePreviewUrls];

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

  const handleVideoSelect = (e) => {
    const files = Array.from(e.target.files);
    const newVideos = [...formData.videos];
    const newPreviewUrls = [...videoPreviewUrls];

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
    setVideoPreviewUrls(newPreviewUrls);
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
    const newPreviewUrls = [...videoPreviewUrls, videoUrl];

    setFormData(prev => ({
      ...prev,
      videos: newVideos,
      tempVideoUrl: ''
    }));
    setVideoPreviewUrls(newPreviewUrls);
  };

  const handleRemoveImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);

    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
    setImagePreviewUrls(newPreviewUrls);
  };

  const handleRemoveVideo = (index) => {
    const newVideos = formData.videos.filter((_, i) => i !== index);
    const newPreviewUrls = videoPreviewUrls.filter((_, i) => i !== index);

    setFormData(prev => ({
      ...prev,
      videos: newVideos
    }));
    setVideoPreviewUrls(newPreviewUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();

    Object.keys(formData).forEach(key => {
      if (key !== 'images' && key !== 'videos' && key !== 'tempVideoUrl') {
        submitData.append(key, formData[key]);
      }
    });

    formData.images.forEach((image) => {
      submitData.append('images', image);
    });

    formData.videos.forEach((video, index) => {
      if (video instanceof File) {
        submitData.append('videos', video);
      } else {
        submitData.append(`videoUrls[${index}]`, video);
      }
    });

    onSubmit(submitData);
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
          {imagePreviewUrls.map((url, index) => (
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
          {imagePreviewUrls.length < 10 && (
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
          {imagePreviewUrls.length}/10 images uploaded. Click to add more images.
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
          {videoPreviewUrls.map((url, index) => (
            <Box key={index} position="relative">
              <AspectRatio ratio={16 / 9}>
                {typeof formData.videos[index] === 'string' ? (
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
          {videoPreviewUrls.length < 5 && (
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

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialFormState,
        ...initialData,
        images: initialData.images || [],
        videos: initialData.videos || [],
        carpetAreaUnit: initialData.carpetAreaUnit || 'sqft',
        loanAvailable: initialData.loanAvailable || 'no',
        reraApproved: initialData.reraApproved || 'no',
      });

      // Update image previews
      if (initialData.images && Array.isArray(initialData.images)) {
        const newPreviewUrls = initialData.images.map(img =>
          typeof img === 'string' ? img : URL.createObjectURL(img)
        );
        setImagePreviewUrls(newPreviewUrls);
      } else {
        setImagePreviewUrls([]);
      }

      // Update video previews
      if (initialData.videos && Array.isArray(initialData.videos)) {
        const newVideoPreviewUrls = initialData.videos.map(video =>
          typeof video === 'string' ? video : URL.createObjectURL(video)
        );
        setVideoPreviewUrls(newVideoPreviewUrls);
      } else {
        setVideoPreviewUrls([]);
      }
    } else {
      setFormData(initialFormState);
      setImagePreviewUrls([]);
      setVideoPreviewUrls([]);
    }
  }, [initialData]);

  return (
    <Box flex="1" overflowY="auto" pr={2}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          {/* 1. Basic Property Details */}
          <Box>
            <Heading size="sm" mb={4}>Basic Property Details</Heading>
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

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter property description"
                  minH="150px"
                  resize="vertical"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Property Type</FormLabel>
                <Select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                >
                  <option value="">Select Property Type</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Property Subtype</FormLabel>
                <Select
                  name="propertySubtype"
                  value={formData.propertySubtype}
                  onChange={handleInputChange}
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
                    </>
                  )}
                  {formData.propertyType === 'commercial' && (
                    <>
                      <option value="office">Office Space</option>
                      <option value="retail">Retail Shop</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="showroom">Showroom</option>
                      <option value="commercialPlot">Commercial Plot</option>
                    </>
                  )}
                  {formData.propertyType === 'industrial' && (
                    <>
                      <option value="factory">Factory</option>
                      <option value="industrialPlot">Industrial Plot</option>
                      <option value="industrialShed">Industrial Shed</option>
                    </>
                  )}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Property Choice</FormLabel>
                <Select
                  name="propertyChoice"
                  value={formData.propertyChoice}
                  onChange={handleInputChange}
                >
                  <option value="">Select Choice</option>
                  <option value="ready">Ready to Move</option>
                  <option value="underConstruction">Under Construction</option>
                </Select>
              </FormControl>

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
                  />
                  <Select
                    name="carpetAreaUnit"
                    value={formData.carpetAreaUnit}
                    onChange={handleInputChange}
                    width="120px"
                  >
                    <option value="sqft">Sq. Ft.</option>
                    <option value="sqyd">Sq. Yd.</option>
                    <option value="sqm">Sq. M.</option>
                  </Select>
                </Flex>
              </FormControl>

              <FormControl>
                <FormLabel>Age of Construction</FormLabel>
                <Input
                  name="ageOfConstruction"
                  value={formData.ageOfConstruction}
                  onChange={handleInputChange}
                  placeholder="e.g., 2 years"
                />
              </FormControl>
            </VStack>
          </Box>

          {/* 2. Location Details */}
          <Box>
            <Heading size="sm" mb={4}>Location Details</Heading>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Location</FormLabel>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Landmark</FormLabel>
                <Input
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Google Maps URL</FormLabel>
                <Input
                  name="googleMapsUrl"
                  value={formData.googleMapsUrl}
                  onChange={handleInputChange}
                />
              </FormControl>
            </VStack>
          </Box>

          {/* 3. Pricing & Ownership */}
          <Box>
            <Heading size="sm" mb={4}>Pricing & Ownership</Heading>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Price Breakup</FormLabel>
                <Input
                  name="priceBreakup"
                  value={formData.priceBreakup}
                  onChange={handleInputChange}
                  type="text"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Type of Ownership</FormLabel>
                <Select
                  name="typeOfOwnership"
                  value={formData.typeOfOwnership}
                  onChange={handleInputChange}
                >
                  <option value="">Select Ownership Type</option>
                  <option value="freehold">Freehold</option>
                  <option value="leasehold">Leasehold</option>
                  <option value="cooperative">Cooperative</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Loan Available</FormLabel>
                <Select
                  name="loanAvailable"
                  value={formData.loanAvailable}
                  onChange={handleInputChange}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </Select>
              </FormControl>

              {formData.loanAvailable === 'yes' && (
                <FormControl>
                  <FormLabel>Bank Name</FormLabel>
                  <Input
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                  />
                </FormControl>
              )}

              <FormControl>
                <FormLabel>RERA Approved</FormLabel>
                <Select
                  name="reraApproved"
                  value={formData.reraApproved}
                  onChange={handleInputChange}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </Select>
              </FormControl>

              {formData.reraApproved === 'yes' && (
                <FormControl>
                  <FormLabel>RERA Number</FormLabel>
                  <Input
                    name="reraNumber"
                    value={formData.reraNumber}
                    onChange={handleInputChange}
                  />
                </FormControl>
              )}
            </VStack>
          </Box>

          {/* 4. Property Specifications */}
          <Box>
            <Heading size="sm" mb={4}>Property Specifications</Heading>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Bedrooms</FormLabel>
                <Input
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  type="number"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Bathrooms</FormLabel>
                <Input
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  type="number"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Additional Rooms</FormLabel>
                <Input
                  name="additionalRooms"
                  value={formData.additionalRooms}
                  onChange={handleInputChange}
                  placeholder="e.g., Study, Pooja Room"
                />
              </FormControl>

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
                  />
                  <Text>out of</Text>
                  <Input
                    name="totalFloors"
                    value={formData.totalFloors || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalFloors: e.target.value }))}
                    type="number"
                    placeholder="Total"
                    width="100px"
                  />
                </Flex>
              </FormControl>

              <FormControl>
                <FormLabel>Facing</FormLabel>
                <Select
                  name="facing"
                  value={formData.facing}
                  onChange={handleInputChange}
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

              <FormControl>
                <FormLabel>Amenities</FormLabel>
                <Input
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleInputChange}
                  placeholder="e.g., Swimming Pool, Gym"
                />
              </FormControl>
            </VStack>
          </Box>

          {/* 5. Developer & Project Information */}
          <Box>
            <Heading size="sm" mb={4}>Developer & Project Information</Heading>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Developer</FormLabel>
                <Input
                  name="developer"
                  value={formData.developer}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Project Name</FormLabel>
                <Input
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                />
              </FormControl>
            </VStack>
          </Box>

          {/* 6. Owner / Seller Details */}
          <Box>
            <Heading size="sm" mb={4}>Owner / Seller Details</Heading>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Owner Name</FormLabel>
                <Input
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Owner Contact No.</FormLabel>
                <Input
                  name="ownerContactNo"
                  value={formData.ownerContactNo}
                  onChange={handleInputChange}
                  type="tel"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Owner Email</FormLabel>
                <Input
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleInputChange}
                  type="email"
                />
              </FormControl>
            </VStack>
          </Box>

          {/* 7. Media & Connectivity */}
          <Box>
            <Heading size="sm" mb={4}>Media & Connectivity</Heading>
            {imageUploadSection}
            {videoUploadSection}
            <FormControl mt={4}>
              <FormLabel>Connectivity</FormLabel>
              <Textarea
                name="connectivity"
                value={formData.connectivity}
                onChange={handleInputChange}
                placeholder="Describe the connectivity details..."
              />
            </FormControl>
          </Box>

          <Flex gap={4}>
            {isEditing && (
              <Button
                onClick={onCancel}
                size="lg"
                width="full"
                variant="ghost"
                isDisabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width="full"
              isLoading={isSubmitting}
              loadingText={isEditing ? "Updating..." : "Creating..."}
            >
              {isEditing ? 'Update Property' : 'Add Property'}
            </Button>
          </Flex>
        </VStack>
      </form>
    </Box>
  );
} 