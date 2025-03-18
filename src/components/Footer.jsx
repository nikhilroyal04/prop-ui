import { Box, Text } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box 
      as="footer" 
      py={4} 
      textAlign="center"
      borderTop="1px" 
      borderColor="gray.200"
    >
      <Text color="gray.600">
        © {new Date().getFullYear()} PropCID. All rights reserved.
      </Text>
    </Box>
  );
};

export default Footer; 