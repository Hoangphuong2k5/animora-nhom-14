import React from 'react';
import { AuthMode, Language, UserAccount } from '@/types';
import { AuthLoginForm } from './AuthLoginForm';
import { AuthRegisterForm } from './AuthRegisterForm';
import { AuthForgotPasswordForm } from './AuthForgotPasswordForm';
import { AccountManagementPanel } from './AccountManagementPanel';
import { GoogleQuickLoginSection } from './GoogleQuickLoginSection';
import { UseAuthFlowsReturn } from './useAuthFlows';
import { UseAccountManagementReturn } from './useAccountManagement';

interface AuthModeContentProps {
  lang: Language;
  mode: AuthMode;
  currentUser: UserAccount | null;
  authFlows: UseAuthFlowsReturn;
  accountMgmt: UseAccountManagementReturn;
  onSwitchMode: (mode: AuthMode) => void;
  onClearFeedback: () => void;
  showDemoLoginButton?: boolean;
  showAccountUserHeader?: boolean;
  onOpenTermsModal?: (type: 'terms' | 'privacy') => void;
  onLogout?: () => void;
}

/**
 * Shared mode body switcher rendering Login, Register, Forgot Password,
 * or Account Management using shared authFlows and accountMgmt hooks.
 */
export const AuthModeContent = ({
  lang,
  mode,
  currentUser,
  authFlows,
  accountMgmt,
  onSwitchMode,
  onClearFeedback,
  showDemoLoginButton = false,
  showAccountUserHeader = false,
  onOpenTermsModal,
  onLogout,
}: AuthModeContentProps) => {
  const googleSection = (
    <GoogleQuickLoginSection
      lang={lang}
      mode={mode}
      gmailPickerOpen={authFlows.gmailPickerOpen}
      setGmailPickerOpen={authFlows.setGmailPickerOpen}
      customGmailMode={authFlows.customGmailMode}
      setCustomGmailMode={authFlows.setCustomGmailMode}
      customGmailName={authFlows.customGmailName}
      setCustomGmailName={authFlows.setCustomGmailName}
      customGmailAddress={authFlows.customGmailAddress}
      setCustomGmailAddress={authFlows.setCustomGmailAddress}
      onSelectAccount={authFlows.handleGmailAccountSelect}
      onSubmitCustomGmail={authFlows.handleCustomGmailSubmit}
    />
  );

  if (mode === 'login') {
    return (
      <AuthLoginForm
        lang={lang}
        loginIdentifier={authFlows.loginIdentifier}
        setLoginIdentifier={authFlows.setLoginIdentifier}
        loginPassword={authFlows.loginPassword}
        setLoginPassword={authFlows.setLoginPassword}
        showLoginPass={authFlows.showLoginPass}
        setShowLoginPass={authFlows.setShowLoginPass}
        rememberMe={authFlows.rememberMe}
        setRememberMe={authFlows.setRememberMe}
        isSubmittingLogin={authFlows.isSubmittingLogin}
        onSubmit={authFlows.handleLoginSubmit}
        onSwitchMode={onSwitchMode}
        showDemoLoginButton={showDemoLoginButton}
        onDemoLogin={authFlows.handleDemoLogin}
        googleSection={googleSection}
      />
    );
  }

  if (mode === 'register') {
    return (
      <AuthRegisterForm
        lang={lang}
        regName={authFlows.regName}
        setRegName={authFlows.setRegName}
        regEmail={authFlows.regEmail}
        setRegEmail={authFlows.setRegEmail}
        regPhone={authFlows.regPhone}
        setRegPhone={authFlows.setRegPhone}
        regPassword={authFlows.regPassword}
        setRegPassword={authFlows.setRegPassword}
        regConfirmPassword={authFlows.regConfirmPassword}
        setRegConfirmPassword={authFlows.setRegConfirmPassword}
        showRegPass={authFlows.showRegPass}
        setShowRegPass={authFlows.setShowRegPass}
        showRegConfirmPass={authFlows.showRegConfirmPass}
        setShowRegConfirmPass={authFlows.setShowRegConfirmPass}
        agreeTerms={authFlows.agreeTerms}
        setAgreeTerms={authFlows.setAgreeTerms}
        isSubmittingRegister={authFlows.isSubmittingRegister}
        onSubmit={authFlows.handleRegisterSubmit}
        onSwitchMode={onSwitchMode}
        onOpenTermsModal={onOpenTermsModal}
        googleSection={googleSection}
      />
    );
  }

  if (mode === 'forgot-password') {
    return (
      <AuthForgotPasswordForm
        lang={lang}
        forgotStep={authFlows.forgotStep}
        forgotIdentifier={authFlows.forgotIdentifier}
        setForgotIdentifier={authFlows.setForgotIdentifier}
        forgotOtp={authFlows.forgotOtp}
        setForgotOtp={authFlows.setForgotOtp}
        forgotNewPass={authFlows.forgotNewPass}
        setForgotNewPass={authFlows.setForgotNewPass}
        forgotConfirmPass={authFlows.forgotConfirmPass}
        setForgotConfirmPass={authFlows.setForgotConfirmPass}
        onSendOtp={authFlows.handleSendOtp}
        onResetPassword={authFlows.handleResetPassword}
        onSwitchMode={onSwitchMode}
      />
    );
  }

  if (mode === 'account' && currentUser) {
    return (
      <AccountManagementPanel
        lang={lang}
        currentUser={currentUser}
        accountTab={accountMgmt.accountTab}
        onSelectTab={(tab) => {
          onClearFeedback();
          accountMgmt.setAccountTab(tab);
        }}
        editName={accountMgmt.editName}
        setEditName={accountMgmt.setEditName}
        editEmail={accountMgmt.editEmail}
        setEditEmail={accountMgmt.setEditEmail}
        editPhone={accountMgmt.editPhone}
        setEditPhone={accountMgmt.setEditPhone}
        showAddAddress={accountMgmt.showAddAddress}
        setShowAddAddress={accountMgmt.setShowAddAddress}
        addrLabel={accountMgmt.addrLabel}
        setAddrLabel={accountMgmt.setAddrLabel}
        addrRecipient={accountMgmt.addrRecipient}
        setAddrRecipient={accountMgmt.setAddrRecipient}
        addrPhone={accountMgmt.addrPhone}
        setAddrPhone={accountMgmt.setAddrPhone}
        addrLine={accountMgmt.addrLine}
        setAddrLine={accountMgmt.setAddrLine}
        currentPassInput={accountMgmt.currentPassInput}
        setCurrentPassInput={accountMgmt.setCurrentPassInput}
        newPassInput={accountMgmt.newPassInput}
        setNewPassInput={accountMgmt.setNewPassInput}
        confirmNewPassInput={accountMgmt.confirmNewPassInput}
        setConfirmNewPassInput={accountMgmt.setConfirmNewPassInput}
        onSaveProfile={accountMgmt.handleSaveProfile}
        onAddAddress={accountMgmt.handleAddAddress}
        onSetDefaultAddress={accountMgmt.handleSetDefaultAddress}
        onDeleteAddress={accountMgmt.handleDeleteAddress}
        onChangePassword={accountMgmt.handleChangePassword}
        showUserHeader={showAccountUserHeader}
        onLogout={onLogout}
      />
    );
  }

  return null;
};
