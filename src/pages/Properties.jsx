import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Building, Loader2, Edit2, Trash2, Search, ChevronUp, ChevronDown, Eye } from 'lucide-react';
import {
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
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  VStack,
  Collapse,
  FormControl,
  FormLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  IconButton,
  Tooltip,
  useColorModeValue,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import {
  selectProperties,
  selectError,
  selectLoading,
  fetchProperties,
  deleteProperty,
} from '../app/features/propertySlice';
import { useNavigate } from 'react-router-dom';

export default function Properties() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast({
    position: 'top-right',
    duration: 3000,
    isClosable: true,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const properties = useSelector(selectProperties);
  
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search state
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    propertyType: '',
    propertyStatus: '',
    transactionType: '',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: '',
      propertyType: '',
      propertyStatus: '',
      transactionType: '',
      minPrice: '',
      maxPrice: '',
    });
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

  const handleDeleteClick = (property, e) => {
    e.stopPropagation();
    setPropertyToDelete(property);
    onOpen();
  };

  const handleEdit = (id) => {
    navigate(`/properties/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/properties/view/${id}`);
  };

  // Compute filtered properties based on filters
  const filteredProperties = properties.filter(property => {
    return (
      property.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      (filters.propertyType ? property.propertyType === filters.propertyType : true) &&
      (filters.propertyStatus ? property.propertyStatus === filters.propertyStatus : true) &&
      (filters.transactionType ? property.transactionType === filters.transactionType : true) &&
      (filters.minPrice ? property.rate >= Number(filters.minPrice) : true) &&
      (filters.maxPrice ? property.rate <= Number(filters.maxPrice) : true)
    );
  });

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'green';
      case 'sold':
        return 'red';
      case 'rented':
        return 'blue';
      case 'reserved':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  // Get transaction type badge color
  const getTransactionColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'sale':
        return 'purple';
      case 'rent':
        return 'orange';
      default:
        return 'gray';
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
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Properties</Heading>
        <Button colorScheme="blue" onClick={() => navigate('/properties/new')}>
          Add New Property
        </Button>
      </Flex>

      <Card mb={6}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Flex direction={["column", "row"]} gap={4}>
              <InputGroup flex="1">
                <InputLeftElement pointerEvents="none">
                  <Search color="gray.300" />
                </InputLeftElement>
                <Input
                  name="search"
                  placeholder="Search properties..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  size="md"
                  borderRadius="md"
                />
              </InputGroup>

              <Button 
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} 
                variant="outline"
                rightIcon={showAdvancedSearch ? <ChevronUp /> : <ChevronDown />}
                colorScheme="blue"
                size="md"
                borderRadius="md"
                minW={["full", "auto"]}
              >
                {showAdvancedSearch ? "Hide Filters" : "Show Filters"}
              </Button>
            </Flex>

            <Collapse in={showAdvancedSearch} animateOpacity>
              <Box 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                borderColor="gray.200"
                bg="gray.50"
                shadow="sm"
              >
                <Grid templateColumns={["1fr", "repeat(2, 1fr)", "repeat(3, 1fr)"]} gap={4}>
                  <GridItem>
                    <FormControl>
                      <FormLabel fontWeight="medium">Property Type</FormLabel>
                      <Select
                        name="propertyType"
                        value={filters.propertyType}
                        onChange={handleFilterChange}
                        placeholder="All Types"
                        size="md"
                        borderRadius="md"
                      >
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="industrial">Industrial</option>
                      </Select>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel fontWeight="medium">Status</FormLabel>
                      <Select
                        name="propertyStatus"
                        value={filters.propertyStatus}
                        onChange={handleFilterChange}
                        placeholder="All Status"
                        size="md"
                        borderRadius="md"
                      >
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                        <option value="rented">Rented</option>
                      </Select>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel fontWeight="medium">Listing Type</FormLabel>
                      <Select
                        name="transactionType"
                        value={filters.transactionType}
                        onChange={handleFilterChange}
                        placeholder="All Listings"
                        size="md"
                        borderRadius="md"
                      >
                        <option value="sale">Sale</option>
                        <option value="rent">Rent</option>
                      </Select>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel fontWeight="medium">Min Price</FormLabel>
                      <Input
                        name="minPrice"
                        type="number"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        placeholder="Min Price"
                        size="md"
                        borderRadius="md"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel fontWeight="medium">Max Price</FormLabel>
                      <Input
                        name="maxPrice"
                        type="number"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        placeholder="Max Price"
                        size="md"
                        borderRadius="md"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <Flex align="flex-end" height="100%" justify="flex-end">
                      <Button 
                        onClick={resetFilters} 
                        colorScheme="gray" 
                        variant="outline"
                        size="md"
                        borderRadius="md"
                        leftIcon={<Trash2 size={16} />}
                      >
                        Reset Filters
                      </Button>
                    </Flex>
                  </GridItem>
                </Grid>
              </Box>
            </Collapse>
          </VStack>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">Properties ({filteredProperties?.length || 0})</Heading>
          </Flex>

          {filteredProperties.length > 0 ? (
            <TableContainer>
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th width="20%">Title</Th>
                    <Th width="10%">Property No</Th>
                    <Th width="10%">Type</Th>
                    <Th width="10%">Subtype</Th>
                    <Th width="10%">Status</Th>
                    <Th width="10%">Listing</Th>
                    <Th width="10%">Rate</Th>
                    <Th width="15%">Location</Th>
                    <Th width="5%">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredProperties.map((property) => (
                    <Tr 
                      key={property.id}
                      onClick={() => handleView(property.id)}
                      cursor="pointer"
                      _hover={{ bg: 'gray.50' }}
                      transition="background-color 0.2s"
                    >
                      <Td fontWeight="medium" maxW="200px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                        {property.title}
                      </Td>
                      <Td>{property.propertyNo || 'N/A'}</Td>
                      <Td textTransform="capitalize">{property.propertyType || 'N/A'}</Td>
                      <Td textTransform="capitalize">{property.propertySubtype || 'N/A'}</Td>
                      <Td>
                        <Badge 
                          colorScheme={getStatusColor(property.propertyStatus)}
                          px={2}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="medium"
                        >
                          {property.propertyStatus || 'N/A'}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={getTransactionColor(property.transactionType)}
                          px={2}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="medium"
                        >
                          {property.transactionType || 'N/A'}
                        </Badge>
                      </Td>
                      <Td fontWeight="bold" color="blue.600">
                        ₹{property.rate?.toLocaleString('en-IN') || 'N/A'}
                      </Td>
                      <Td maxW="150px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                        {property.location || 'N/A'}
                      </Td>
                      <Td>
                        <HStack spacing={2} justify="center">
                          <Tooltip label="View Property" placement="top">
                            <IconButton
                              size="sm"
                              icon={<Eye size={16} />}
                              colorScheme="gray"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(property.id);
                              }}
                            />
                          </Tooltip>
                          <Tooltip label="Edit Property" placement="top">
                            <IconButton
                              size="sm"
                              icon={<Edit2 size={16} />}
                              colorScheme="blue"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(property.id);
                              }}
                            />
                          </Tooltip>
                          <Tooltip label="Delete Property" placement="top">
                            <IconButton
                              size="sm"
                              icon={<Trash2 size={16} />}
                              colorScheme="red"
                              variant="ghost"
                              onClick={(e) => handleDeleteClick(property, e)}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" gap={4} py={8}>
              <Building size={60} color="gray" />
              <Heading size="md" color="gray.500">No Properties Found</Heading>
              <Text color="gray.400">No properties match your search criteria</Text>
            </Box>
          )}
        </CardBody>
      </Card>

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