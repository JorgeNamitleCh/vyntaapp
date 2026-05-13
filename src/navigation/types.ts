import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Otp: { phoneNumber: string; verificationId: string };
};

export type ExpensesStackParamList = {
  ExpensesList: undefined;
  AddExpense: undefined;
};

export type ExpensesListScreenProps = NativeStackScreenProps<ExpensesStackParamList, 'ExpensesList'>;
export type AddExpenseScreenProps = NativeStackScreenProps<ExpensesStackParamList, 'AddExpense'>;

export type InventoryStackParamList = {
  InventoryList: undefined;
  AddProduct: { productId?: string } | undefined;
};

export type InventoryListScreenProps = NativeStackScreenProps<InventoryStackParamList, 'InventoryList'>;
export type AddProductScreenProps = NativeStackScreenProps<InventoryStackParamList, 'AddProduct'>;

export type OnboardingStep1Params = {
  name: string;
  businessType: string | null;
  currency: string;
};

export type OnboardingStep2Params = OnboardingStep1Params & {
  channels: string[];
};

export type OnboardingStackParamList = {
  CreateBusiness: undefined;
  SalesChannels: OnboardingStep1Params;
  BusinessSetup: OnboardingStep2Params;
};

export type AppTabParamList = {
  Home: undefined;
  Inventory: undefined;
  Expenses: undefined;
  Reports: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<AppTabParamList>;
  POS: undefined;
  Cart: undefined;
  Payment: undefined;
  SaleSuccess: { total: number; change: number; received: number; itemCount: number; paymentMethod: string; channel: string };
  Settings: undefined;
  Paywall: undefined;
  Notifications: undefined;
  BillingInfo: undefined;
  Employees: undefined;
  PaymentMethods: undefined;
  Taxes: undefined;
  LogoReceipt: undefined;
  ExportData: undefined;
  Preferences: undefined;
  HelpSupport: undefined;
  BusinessEdit: undefined;
  SwitchBusiness: undefined;
  SaleDetail: { saleId: string };
};

export type SaleDetailScreenProps = NativeStackScreenProps<AppStackParamList, 'SaleDetail'>;

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};

export type WelcomeScreenProps = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type OtpScreenProps = NativeStackScreenProps<AuthStackParamList, 'Otp'>;
export type CreateBusinessScreenProps = NativeStackScreenProps<OnboardingStackParamList, 'CreateBusiness'>;
export type SalesChannelsScreenProps = NativeStackScreenProps<OnboardingStackParamList, 'SalesChannels'>;
export type BusinessSetupScreenProps = NativeStackScreenProps<OnboardingStackParamList, 'BusinessSetup'>;
export type HomeScreenProps = BottomTabScreenProps<AppTabParamList, 'Home'>;
export type AppTabProps<T extends keyof AppTabParamList> = BottomTabScreenProps<AppTabParamList, T>;
export type POSScreenProps = NativeStackScreenProps<AppStackParamList, 'POS'>;
export type CartScreenProps = NativeStackScreenProps<AppStackParamList, 'Cart'>;
export type PaymentScreenProps = NativeStackScreenProps<AppStackParamList, 'Payment'>;
export type SaleSuccessScreenProps = NativeStackScreenProps<AppStackParamList, 'SaleSuccess'>;
