import axios from "axios";
const BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

export const getFavorites = async (accessToken: string) => {
  return axios.get(`${BASE_URL}/interaction/favorites`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
export const addFavorite = async (productId: number, accessToken: string) => {
  return axios.post(
    `${BASE_URL}/api/interaction/like/${productId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};
export const removeFavorite = async (productId: number, accessToken: string) => {
  return axios.delete(`${BASE_URL}/api/interaction/unlike/${productId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
