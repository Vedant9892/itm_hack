import api from './api';


export const onBoarding = async (onBoardingData) =>{
  try {
    const response = await api.post(`${import.meta.env.VITE_API_BASE_URL}/onboarding`, onBoardingData);
    return response.data;
  } catch (error) {
    console.error('Onboarding failed', error);
    throw error;
  }
}

// const onboardingService = {
//   saveProfile: async (profileData) => {
//     // In a real app, this would be a POST to /user/profile
//     const response = await api.post('/user/onboarding', profileData);
//     return response.data;
//   },
  
//   // Potential future endpoint to check if onboarding is needed
//   getStatus: async () => {
//     const response = await api.get('/user/onboarding/status');
//     return response.data;
//   }
// };

// export default onboardingService;
