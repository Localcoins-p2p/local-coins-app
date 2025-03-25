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
    balance: Float
    availableForWithdrawal: Float
    points: Int
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
    isFloating: Boolean
    profitPercentage: Float
    screenshotMehtods: [String]
    screenshots: [ScreenShot]
    seller: User
    buyer: User
    tx: String
    onChainSaleId: Int
    createdAt: Date
    finishedAt: Date
    isDisputed: Boolean
    paidAt: Date
    blockchain: String
    currency: String
    canceledAt: Date
    disputedBy: String
    hasScreenshots: Boolean
  }

  type Transaction {
    id: ID!
    blockchain: String
    amount: Float
    size: Float
    currency: String
    tx: String
    createdAt: Date
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
    count: Int
  }
  type Screenshot {
    id: String!
    imageUrl: String
    method: String
    paidById: String
    sale: Sale!
  }

  type UserReputation {
    value: Float
  }

  type ScoreResponse {
    score: Float
  }

  type SaleMatch {
    publicKey: String
  }

  input SaleFilters {
    isDisputed: Boolean
  }

  type Query {
    user: User
    sales(id: String, filters: SaleFilters, skip: Int, take: Int): SaleResponse
    paymentMethods: [PaymentMethod]
    sellerSales: [Sale]
    buyerSales: [Sale]
    getUserReputation(publicKey: String): UserReputation
    getActivitiesStatus: ScoreResponse
    transactions: [Transaction]
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
      wallet: String
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
      isFloating: Boolean
      profitPercentage: Float
      screenshotMethods: [String]
      onChainSaleId: Int
      tx: String
      blockchain: String!
      currency: String!
      sellerPublicKey: String!
    ): Sale
    addRemoveBuyer(id: String!, command: String!): Sale
    cancelSale(id: String!): Sale
    markSalePaid(id: String!, referenceId: String!): Sale
    isReferenceIdCorrect(referenceId: String!, id: String!): StatusResponse
    markSaleFinished(id: String!): Sale
    addScreenshot(
      saleId: String!
      imageUrl: String!
      method: String!
      referenceId: String!
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

    markDisputed(saleId: String!): Sale!
    createTransaction(
      blockchain: String!
      amount: Float!
      currency: String!
      tx: String!
    ): Transaction
    matchSeller(amount: Float!): SaleMatch
  }

  ${projectTypedefs}
`;

export default typeDefs;
