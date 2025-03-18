import { Box, Flex, Button, Image, Text } from "@chakra-ui/react";
import { FaUser } from "react-icons/fa";

const Header = () => {
  return (
    <Box as="header" py={4} px={8} bg="white" boxShadow="sm">
      <Flex justify="space-between" align="center" maxW="1200px" mx="auto">
        {/* Logo */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold">Property Management System</Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default Header; 