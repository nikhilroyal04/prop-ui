import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Text,
  Grid,
  GridItem,
  Image,
  AspectRatio,
  VStack,
  HStack,
  IconButton,
  useToast,
  Flex,
  Badge,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Container,
  useColorModeValue,
  CardHeader,
  Stack,
  Tag,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
  Tooltip,
  Avatar,
  AvatarGroup,
  Wrap,
  WrapItem,
  Icon,
} from '@chakra-ui/react';
import { 
  Edit2, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Play,
  Home,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Ruler,
  BedDouble,
  Bath,
  Building,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
  Star,
  Users,
  Heart,
  Share2,
} from 'lucide-react';
import { selectSelectedProperty, fetchPropertyById, selectLoading } from '../app/features/propertySlice';

export default function PropertyView() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const property = useSelector(selectSelectedProperty);
  const loading = useSelector(selectLoading);
  const toast = useToast({
    position: 'top-right',
    duration: 3000,
    isClosable: true,
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('images');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    dispatch(fetchPropertyById(id));
  }, [dispatch, id]);

  const handlePrevMedia = () => {
    if (activeTab === 'images' && property?.images?.length > 0) {
      setCurrentImageIndex(prev => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    } else if (activeTab === 'videos' && property?.videos?.length > 0) {
      setCurrentVideoIndex(prev => 
        prev === 0 ? property.videos.length - 1 : prev - 1
      );
    }
  };

  const handleNextMedia = () => {
    if (activeTab === 'images' && property?.images?.length > 0) {
      setCurrentImageIndex(prev => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    } else if (activeTab === 'videos' && property?.videos?.length > 0) {
      setCurrentVideoIndex(prev => 
        prev === property.videos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleEdit = () => {
    navigate(`/properties/edit/${id}`);
  };

  if (loading || !property) {
    return (
      <Container maxW="container.xl" py={8}>
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
            <Heading size="md">Loading property details...</Heading>
          </CardBody>
        </Card>
      </Container>
    );
  }

  const renderMediaCounter = () => {
    if (activeTab === 'images' && property.images?.length > 0) {
      return `${currentImageIndex + 1}/${property.images.length}`;
    } else if (activeTab === 'videos' && property.videos?.length > 0) {
      return `${currentVideoIndex + 1}/${property.videos.length}`;
    }
    return '';
  };

  // Helper function to render array or comma-separated string
  const renderArrayOrString = (value, renderItem) => {
    if (!value) return null;
    
    if (Array.isArray(value)) {
      return value.map(renderItem);
    } else if (typeof value === 'string') {
      return value.split(',').map(renderItem);
    }
    
    return null;
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Button
        leftIcon={<ArrowLeft />}
        variant="ghost"
        mb={6}
        onClick={() => navigate('/properties')}
      >
        Back to Properties
      </Button>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
        <GridItem>
          <Card 
            bg={bgColor} 
            borderWidth="1px" 
            borderColor={borderColor}
            borderRadius="xl"
            overflow="hidden"
            boxShadow="lg"
          >
            <CardBody p={0}>
              <Tabs 
                onChange={(index) => setActiveTab(index === 0 ? 'images' : 'videos')}
                variant="enclosed"
                colorScheme="blue"
              >
                <TabList px={4} pt={4}>
                  <Tab>
                    <HStack>
                      <Icon as={Home} />
                      <Text>Images</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack>
                      <Icon as={Play} />
                      <Text>Videos</Text>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  <TabPanel p={0}>
                    {property.images && property.images.length > 0 ? (
                      <Box position="relative">
                        <AspectRatio ratio={16 / 9}>
                          <Image
                            src={property.images[currentImageIndex]}
                            alt={property.title}
                            objectFit="cover"
                          />
                        </AspectRatio>
                        <Box
                          position="absolute"
                          bottom="4"
                          right="4"
                          bg="blackAlpha.700"
                          color="white"
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="sm"
                        >
                          {renderMediaCounter()}
                        </Box>
                      </Box>
                    ) : (
                      <Box height="300px" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
                        <Text>No images available</Text>
                      </Box>
                    )}
                  </TabPanel>

                  <TabPanel p={0}>
                    {property.videos && property.videos.length > 0 ? (
                      <Box position="relative">
                        <AspectRatio ratio={16 / 9}>
                          <video
                            src={property.videos[currentVideoIndex]}
                            controls
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </AspectRatio>
                        <Box
                          position="absolute"
                          bottom="4"
                          right="4"
                          bg="blackAlpha.700"
                          color="white"
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="sm"
                        >
                          {renderMediaCounter()}
                        </Box>
                      </Box>
                    ) : (
                      <Box height="300px" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
                        <Text>No videos available</Text>
                      </Box>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>

              {(property.images?.length > 1 || property.videos?.length > 1) && (
                <Flex justify="center" mt={4} pb={4}>
                  <IconButton
                    icon={<ChevronLeft />}
                    onClick={handlePrevMedia}
                    mr={2}
                    variant="ghost"
                    _hover={{ bg: hoverBg }}
                  />
                  <IconButton
                    icon={<ChevronRight />}
                    onClick={handleNextMedia}
                    variant="ghost"
                    _hover={{ bg: hoverBg }}
                  />
                </Flex>
              )}

              <Box p={6}>
                <Stack spacing={4}>
                  <Heading size="lg">{property.title}</Heading>
                  
                  <Wrap spacing={2}>
                    <WrapItem>
                      <Tag 
                        size="lg" 
                        colorScheme="blue" 
                        borderRadius="full"
                        px={4}
                        py={2}
                        fontSize="md"
                      >
                        <TagLeftIcon as={Building2} boxSize="16px" mr={2} />
                        <TagLabel>{property.propertyType}</TagLabel>
                      </Tag>
                    </WrapItem>
                    <WrapItem>
                      <Tag 
                        size="lg" 
                        colorScheme="green" 
                        borderRadius="full"
                        px={4}
                        py={2}
                        fontSize="md"
                      >
                        <TagLeftIcon as={CheckCircle2} boxSize="16px" mr={2} />
                        <TagLabel>{property.propertyStatus || 'Available'}</TagLabel>
                      </Tag>
                    </WrapItem>
                    <WrapItem>
                      <Tag 
                        size="lg" 
                        colorScheme="purple" 
                        borderRadius="full"
                        px={4}
                        py={2}
                        fontSize="md"
                      >
                        <TagLeftIcon as={DollarSign} boxSize="16px" mr={2} />
                        <TagLabel>{property.transactionType}</TagLabel>
                      </Tag>
                    </WrapItem>
                    <WrapItem>
                      <Tag 
                        size="lg" 
                        colorScheme="orange" 
                        borderRadius="full"
                        px={4}
                        py={2}
                        fontSize="md"
                      >
                        <TagLeftIcon as={Home} boxSize="16px" mr={2} />
                        <TagLabel>{property.propertySubtype}</TagLabel>
                      </Tag>
                    </WrapItem>
                  </Wrap>

                  <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                    ₹{property.rate}
                  </Text>

                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                    <Stat
                      p={4}
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      borderRadius="lg"
                    >
                      <StatLabel>Carpet Area</StatLabel>
                      <StatNumber fontSize="xl">{property.carpetArea} {property.carpetAreaUnit}</StatNumber>
                    </Stat>
                    <Stat
                      p={4}
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      borderRadius="lg"
                    >
                      <StatLabel>Price per sq ft</StatLabel>
                      <StatNumber fontSize="xl">{property.priceBreakup || 'N/A'}</StatNumber>
                    </Stat>
                    <Stat
                      p={4}
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      borderRadius="lg"
                    >
                      <StatLabel>Floor</StatLabel>
                      <StatNumber fontSize="xl">{property.currentFloor} of {property.totalFloors}</StatNumber>
                    </Stat>
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                    <Stat
                      p={4}
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      borderRadius="lg"
                    >
                      <StatLabel>Bedrooms</StatLabel>
                      <StatNumber fontSize="xl">{property.bedrooms}</StatNumber>
                    </Stat>
                    <Stat
                      p={4}
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      borderRadius="lg"
                    >
                      <StatLabel>Bathrooms</StatLabel>
                      <StatNumber fontSize="xl">{property.bathrooms}</StatNumber>
                    </Stat>
                    <Stat
                      p={4}
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      borderRadius="lg"
                    >
                      <StatLabel>Age</StatLabel>
                      <StatNumber fontSize="xl">{property.ageOfConstruction} years</StatNumber>
                    </Stat>
                  </SimpleGrid>

                  <Box>
                    <Heading size="md" mb={2}>Description</Heading>
                    <Text>{property.description}</Text>
                  </Box>

                  <Box>
                    <Heading size="md" mb={2}>Location</Heading>
                    <HStack>
                      <Icon as={MapPin} color="red.500" />
                      <Text>{property.location}</Text>
                    </HStack>
                    <Text ml={6} color="gray.600">{property.landmark}</Text>
                  </Box>

                  <Box>
                    <Heading size="md" mb={2}>Project Details</Heading>
                    <VStack align="stretch" spacing={2}>
                      <HStack>
                        <Icon as={Building2} color="blue.500" />
                        <Text>Project: {property.projectName || 'N/A'}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={Users} color="green.500" />
                        <Text>Developer: {property.developer || 'N/A'}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={CheckCircle2} color="purple.500" />
                        <Text>Ownership: {property.typeOfOwnership || 'N/A'}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={Star} color="yellow.500" />
                        <Text>Facing: {property.facing || 'N/A'}</Text>
                      </HStack>
                    </VStack>
                  </Box>

                  <Box>
                    <Heading size="md" mb={2}>Additional Rooms</Heading>
                    <Text>{property.additionalRooms || 'Not specified'}</Text>
                  </Box>

                  <Box>
                    <Heading size="md" mb={2}>Connectivity</Heading>
                    <Text>{property.connectivity || 'Not specified'}</Text>
                  </Box>

                  <Box>
                    <Heading size="md" mb={4}>Amenities</Heading>
                    <Wrap spacing={3}>
                      {property.amenities && property.amenities.length > 0 ? (
                        Array.isArray(property.amenities) ? (
                          property.amenities.map((amenity, index) => (
                            <WrapItem key={index}>
                              <Tag 
                                size="md" 
                                colorScheme="teal" 
                                borderRadius="full"
                                px={3}
                                py={1.5}
                                fontSize="sm"
                              >
                                <TagLabel>{amenity.trim()}</TagLabel>
                              </Tag>
                            </WrapItem>
                          ))
                        ) : (
                          property.amenities.split(',').map((amenity, index) => (
                            <WrapItem key={index}>
                              <Tag 
                                size="md" 
                                colorScheme="teal" 
                                borderRadius="full"
                                px={3}
                                py={1.5}
                                fontSize="sm"
                              >
                                <TagLabel>{amenity.trim()}</TagLabel>
                              </Tag>
                            </WrapItem>
                          ))
                        )
                      ) : (
                        <Text color="gray.500">No amenities listed</Text>
                      )}
                    </Wrap>
                  </Box>

                  <Box>
                    <Heading size="md" mb={2}>Balconies</Heading>
                    <Text>{property.balconies || 'Not specified'}</Text>
                  </Box>

                  <Box>
                    <Heading size="md" mb={2}>Parking</Heading>
                    <Text>{property.parking || 'Not specified'}</Text>
                  </Box>

                  <Box>
                    <Heading size="md" mb={2}>Furnishing</Heading>
                    <Text>{property.furnishing || 'Not specified'}</Text>
                  </Box>

                  <Box>
                    <Heading size="md" mb={2}>Current Status</Heading>
                    <Text>{property.currentStatus || 'Not specified'}</Text>
                  </Box>
                </Stack>
              </Box>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Stack spacing={6}>
            <Card 
              bg={bgColor} 
              borderWidth="1px" 
              borderColor={borderColor}
              borderRadius="xl"
              overflow="hidden"
              boxShadow="lg"
            >
              <CardHeader bg={useColorModeValue('blue.50', 'blue.900')} py={4}>
                <Heading size="md">Owner Details</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack>
                    <Avatar size="sm" name={property.ownerName} />
                    <Box>
                      <Text fontWeight="bold">{property.ownerName}</Text>
                      <Text fontSize="sm" color="gray.600">Property Owner</Text>
                    </Box>
                  </HStack>
                  <HStack>
                    <Icon as={Phone} color="green.500" />
                    <Text>{property.ownerContactNo}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={Mail} color="blue.500" />
                    <Text>{property.ownerEmail}</Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            <Card 
              bg={bgColor} 
              borderWidth="1px" 
              borderColor={borderColor}
              borderRadius="xl"
              overflow="hidden"
              boxShadow="lg"
            >
              <CardHeader bg={useColorModeValue('green.50', 'green.900')} py={4}>
                <Heading size="md">Loan Information</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack>
                    <Icon as={property.loanAvailable === 'yes' ? CheckCircle2 : XCircle} 
                      color={property.loanAvailable === 'yes' ? 'green.500' : 'red.500'} 
                    />
                    <Text>Loan Available: {property.loanAvailable === 'yes' ? 'Yes' : 'No'}</Text>
                  </HStack>
                  {property.loanAvailable === 'yes' && (
                    <HStack>
                      <Icon as={Building} color="blue.500" />
                      <Text>Bank: {property.bankName}</Text>
                    </HStack>
                  )}
                </VStack>
              </CardBody>
            </Card>

            <Card 
              bg={bgColor} 
              borderWidth="1px" 
              borderColor={borderColor}
              borderRadius="xl"
              overflow="hidden"
              boxShadow="lg"
            >
              <CardHeader bg={useColorModeValue('purple.50', 'purple.900')} py={4}>
                <Heading size="md">RERA Information</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack>
                    <Icon as={property.reraApproved === 'yes' ? CheckCircle2 : XCircle} 
                      color={property.reraApproved === 'yes' ? 'green.500' : 'red.500'} 
                    />
                    <Text>RERA Approved: {property.reraApproved === 'yes' ? 'Yes' : 'No'}</Text>
                  </HStack>
                  {property.reraApproved === 'yes' && (
                    <HStack>
                      <Icon as={Info} color="blue.500" />
                      <Text>RERA Number: {property.reraNumber}</Text>
                    </HStack>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {property.googleMapsUrl && (
              <Card 
                bg={bgColor} 
                borderWidth="1px" 
                borderColor={borderColor}
                borderRadius="xl"
                overflow="hidden"
                boxShadow="lg"
              >
                <CardHeader bg={useColorModeValue('orange.50', 'orange.900')} py={4}>
                  <Heading size="md">Location Map</Heading>
                </CardHeader>
                <CardBody>
                  <AspectRatio ratio={16 / 9}>
                    <iframe
                      src={property.googleMapsUrl}
                      allowFullScreen
                      loading="lazy"
                    />
                  </AspectRatio>
                </CardBody>
              </Card>
            )}

            <Card 
              bg={bgColor} 
              borderWidth="1px" 
              borderColor={borderColor}
              borderRadius="xl"
              overflow="hidden"
              boxShadow="lg"
            >
              <CardHeader bg={useColorModeValue('gray.50', 'gray.700')} py={4}>
                <Heading size="md">Timestamps</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack>
                    <Icon as={Calendar} color="blue.500" />
                    <Text>Created: {new Date(parseInt(property.createdOn)).toLocaleDateString()}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={Clock} color="green.500" />
                    <Text>Updated: {new Date(property.updatedOn).toLocaleDateString()}</Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            <Button
              leftIcon={<Edit2 />}
              colorScheme="blue"
              size="lg"
              width="full"
              onClick={handleEdit}
              borderRadius="xl"
            >
              Edit Property
            </Button>
          </Stack>
        </GridItem>
      </Grid>
    </Container>
  );
} 