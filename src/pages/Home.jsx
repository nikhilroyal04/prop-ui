import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Text, 
  VStack, 
  Button, 
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  useToast,
  Heading,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { Eye, EyeOff } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast({
    position: 'top-right',
    duration: 3000,
    isClosable: true,
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (email === 'propcid@gmail.com' && password === 'propcid123') {
        // Set authentication
        localStorage.setItem('isAuthenticated', 'true');
        
        // Show success toast
        toast({
          title: 'Login Successful',
          status: 'success',
          duration: 3000,
        });

        // Navigate immediately
        navigate('/properties', { replace: true });
      } else {
        setError('Invalid email or password');
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password',
          status: 'error',
          duration: 3000,
        });
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      <Box 
        p={6} 
        maxWidth="400px" 
        borderWidth={1} 
        borderRadius="lg" 
        boxShadow="lg"
        bg="white"
        w="90%"
        maxH="90vh"
        overflowY="auto"
      >
        <VStack spacing={6}>
          <Heading size="lg">PropCID Login</Heading>
          
          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!error}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </FormControl>

              <FormControl isInvalid={!!error}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <InputRightElement>
                    <IconButton
                      icon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
                {error && <FormErrorMessage>{error}</FormErrorMessage>}
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="full"
                isLoading={isLoading}
                loadingText="Logging in..."
              >
                Login
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Box>
  );
}
