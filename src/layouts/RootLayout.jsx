import { Outlet } from 'react-router-dom';
import { Flex, Box } from '@chakra-ui/react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function RootLayout() {
  return (
    <Flex minH="100vh" direction="column">
      <Header />
      <Box flex="1" as="main">
        <Outlet />
      </Box>
      <Footer />
    </Flex>
  );
} 