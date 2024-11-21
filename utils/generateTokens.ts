import jwt from 'jsonwebtoken';
import UserModel from '../models/user_models'

const generateAccessToken = async (userId: string): Promise<string> => {
  const token = await jwt.sign({ id: userId }, process.env.SECRET_KEY_ACCESS_TOKEN || 'secret_key_access', { expiresIn: '5h' })

  const updateRefershTokenUser = await UserModel.updateOne(
    { _id: userId },
    { access_token: token }
  )

  return token;
}

const generateRefreshToken = async (userId: string): Promise<string> => {
  const token = await jwt.sign({ id: userId }, process.env.SECRET_KEY_REFRESH_TOKEN || 'secret_key_refresh', { expiresIn: '7d' })
  await UserModel.updateOne(
    { _id: userId },
    { refresh_token: token }
  )

  return token;
}

export { generateAccessToken, generateRefreshToken }