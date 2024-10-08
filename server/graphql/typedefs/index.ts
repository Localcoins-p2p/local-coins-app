import { gql } from 'graphql-tag';
import projectTypedefs from './project';

const typeDefs = gql`
  scalar Date

  type User {
    id: String!
    name: String
    email: String
    address: String
    state: String
    country: String
    isAdmin: Boolean
    publicKey: String
    termsAccepted: Boolean
    paymentMethods: [PaymentMethod]
  }

  type PaymentMethod {
    id: ID!
    name: String
    accountNumber: String
    accountName: String
  }

  type ScreenShot {
    id: ID!
    saleId: String
    imageUrl: String
    method: PaymentMethod
  }

  type Sale {
    id: ID!
    amount: Float
    unitPrice: Float
    screenshotMehtods: [String]
    screenshots: [ScreenShot]
    seller: User
    buyer: User
    tx: String
    onChainSaleId: Int
    createdAt: Date
    finishedAt: Date
    paidAt: Date
    canceledAt: Date
  }

  type LoginResponse {
    token: String
    error: String
    user: User
  }

  type StatusResponse {
    message: String
    status: String!
  }
  type MessageResponse {
    message: String!
  }

  type NonceResponse {
    nonce: String
    error: String
  }

  type SaleResponse {
    sales: [Sale]
  }
  type Screenshot {
    id: String!
    imageUrl: String
    method: String
    paidById: String
    sale: Sale!
  }

  type Query {
    user: User
    sales(id: String): SaleResponse
    paymentMethods: [PaymentMethod]
    sellerSales: [Sale]
    buyerSales: [Sale]
  }

  type Mutation {
    registerUser(
      name: String!
      email: String!
      address: String
      state: String
      country: String
      password: String!
    ): User
    updateUser(
      name: String
      email: String
      termsAccepted: Boolean
      country: String
    ): User
    login(
      publicKey: String!
      nonce: String!
      signedMessage: String!
    ): LoginResponse!
    sendResetPasswordLink(email: String!): MessageResponse!
    resetPassword(password: String!, token: String!): StatusResponse!
    sendVerificationEmail(email: String!): MessageResponse!
    verifyEmail(token: String!): StatusResponse!
    updateAdminStatus(userId: String!, status: Boolean): User
    deleteUser(id: String!): User
    generateNonce(publicKey: String!): NonceResponse

    sendPhoneOtp(phoneNo: String): StatusResponse
    phoneOtpLogin(otp: String, phoneNo: String): LoginResponse!

    createSale(
      amount: Float
      unitPrice: Float
      screenshotMethods: [String]
      onChainSaleId: Int
      tx: String
    ): Sale
    addRemoveBuyer(id: String!, command: String!): Sale
    cancelSale(id: String!): Sale
    markSalePaid(id: String!): Sale
    markSaleFinished(id: String!): Sale
    addScreenshot(
      saleId: String!
      imageUrl: String!
      method: String!
    ): Screenshot
    updateProfile(name: String, email: String, termsAccepted: Boolean): User
    addPaymentMethod(
      name: String!
      accountNumber: String!
      accountName: String!
    ): PaymentMethod
    updatePaymentMethod(
      id: String!
      name: String
      accountNumber: String
      accountName: String
    ): PaymentMethod
    deletePaymentMethod(id: String!): PaymentMethod
  }

  ${projectTypedefs}
`;

export default typeDefs;
