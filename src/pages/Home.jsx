import { Link } from 'react-router-dom';
import { Box, Text, VStack, Button, Icon, Flex } from '@chakra-ui/react';
import { Search } from 'lucide-react';

export default function Home() {
  return (
    <Flex minH="80vh" justify="center" align="center">
      <Box 
        p={6} 
        borderWidth={1} 
        borderRadius="lg" 
        boxShadow="md" 
        textAlign="center"
      >
        <VStack spacing={4}>
          <Text fontSize="2xl" fontWeight="bold">
            Find Your Perfect Property
          </Text>
          <Text color="gray.500">
            Browse through a wide selection of properties that fit your needs.
          </Text>
          <Button 
            as={Link} 
            to="/properties" 
            colorScheme="blue" 
            size="lg"
          >
            Browse Properties
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
