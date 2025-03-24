import { Box, Heading, Text, Button, VStack, Image } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      overflow="hidden"
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
    >
      <VStack spacing={6} textAlign="center" p={8}>
        <Heading size="4xl" color="blue.500">
          404
        </Heading>
        <Heading size="xl">Page Not Found</Heading>
        <Text color="gray.600" fontSize="lg">
          Oops! The page you're looking for doesn't exist.
        </Text>
        <Button
          colorScheme="blue"
          size="lg"
          onClick={() => navigate('/')}
        >
          Go Back Home
        </Button>
      </VStack>
    </Box>
  );
};

export default NotFound; 