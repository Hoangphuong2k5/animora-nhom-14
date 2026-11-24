import React, { useState } from 'react';
import { AuthMode, Language, PageId, UserAccount } from '@/types';
import { translations } from '@/data/translations';
import { CONTACT_INFO } from '@/constants/contact.constant';
import { validateLoginInput, validateRegisterInput } from '@/utils/petLogic';
import { ApiError } from '@/services/animora/apiClient';
import {
  forgotPasswordUser,
  loginUser,
  registerUser,
  resetPasswordUser,
} from '@/services/animora/authApi';
import { DEMO_OTP_CODE } from './authConstants';
import {
  buildGmailUser,
  buildModalFallbackUser,
  buildRegisteredUser,
  findUserByIdentifier,
  hasKnownAccount,
  mapBackendUserToAccount,
} from './authFlowHelpers';

const isOfflineOrServerError = (err: unknown): boolean =>
  !(err instanceof ApiError) || err.status >= 500;

export interface UseAuthFlowsParams {
  variant: 'page' | 'modal';
  lang: Language;
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  registeredUsers: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
  onRegisterSuccess: (user: UserAccount) => void;
  onResetPasswordSuccess?: (identifier: string, newPassword: string) => void;
  onCloseModal?: () => void;
  onNavigate?: (page: PageId) => void;
  setErrorMsg: (msg: string) => void;
  setSuccessBanner: (msg: string) => void;
}

/**
 * Shared authentication flows for both AuthPage and LoginModal:
 * Login, Register, Google/Gmail Quick Picker, Demo Login, and unified OTP Password Reset.
 */
export function useAuthFlows({
  variant,
  lang,
  mode,
  setMode,
  registeredUsers,
  onLoginSuccess,
  onRegisterSuccess,
  onResetPasswordSuccess,
  onCloseModal,
  onNavigate,
  setErrorMsg,
  setSuccessBanner,
}: UseAuthFlowsParams) {
  const t = translations[lang].loginModal;

  const [gmailPickerOpen, setGmailPickerOpen] = useState(false);
  const [customGmailMode, setCustomGmailMode] = useState(false);
  const [customGmailName, setCustomGmailName] = useState('');
  const [customGmailAddress, setCustomGmailAddress] = useState('');
  const [customGmailPhone, setCustomGmailPhone] = useState('');

  const [loginIdentifier, setLoginIdentifier] = useState(
    variant === 'page' ? CONTACT_INFO.email : ''
  );
  const [loginPassword, setLoginPassword] = useState(variant === 'page' ? '123456' : '');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirmPass, setShowRegConfirmPass] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false);

  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  const resetGmailPicker = () => {
    setGmailPickerOpen(false);
    setCustomGmailMode(false);
  };

  const handleGmailAccountSelect = (account: {
    fullName: string;
    email: string;
    phone: string;
  }) => {
    setErrorMsg('');
    const existing = findUserByIdentifier(
      registeredUsers,
      account.email.trim().toLowerCase()
    );
    if (existing) {
      onLoginSuccess(existing);
      resetGmailPicker();
      onCloseModal?.();
      return;
    }

    const gmailUser = buildGmailUser(account, lang);
    if (mode === 'register') {
      onRegisterSuccess(gmailUser);
    } else {
      onLoginSuccess(gmailUser);
    }
    resetGmailPicker();
    onCloseModal?.();
  };

  const handleCustomGmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const rawEmail = customGmailAddress.trim().toLowerCase();
    const finalEmail = rawEmail.includes('@') ? rawEmail : `${rawEmail}@gmail.com`;

    if (
      !/^[^\s@]+@gmail\.com$/i.test(finalEmail) &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)
    ) {
      setErrorMsg(
        lang === 'vi'
          ? 'Vui lòng nhập địa chỉ Gmail hợp lệ (ví dụ: tenban@gmail.com).'
          : 'Please enter a valid Gmail address (e.g., yourname@gmail.com).'
      );
      return;
    }

    const derivedName =
      customGmailName.trim() ||
      finalEmail
        .split('@')[0]
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

    handleGmailAccountSelect({
      fullName: derivedName,
      email: finalEmail,
      phone: customGmailPhone.trim() || '0337203332',
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanId = loginIdentifier.trim().toLowerCase();
    const normalizedPhoneId = cleanId.replace(/\s+/g, '');

    if (variant === 'modal') {
      const validation = validateLoginInput(loginIdentifier, loginPassword);
      if (!validation.isValid) {
        setErrorMsg(lang === 'vi' ? validation.errorVi || '' : validation.errorEn || '');
        return;
      }
    } else if (!cleanId || !loginPassword.trim()) {
      setErrorMsg(
        lang === 'vi'
          ? 'Vui lòng nhập đầy đủ Email/Số điện thoại và mật khẩu.'
          : 'Please enter both Email/Phone and password.'
      );
      return;
    }

    if (cleanId.includes('@')) {
      setIsSubmittingLogin(true);
      try {
        const beUser = await loginUser(cleanId, loginPassword);
        const mappedUser = mapBackendUserToAccount(beUser, loginPassword);
        onLoginSuccess(mappedUser);
        onCloseModal?.();
        return;
      } catch (err) {
        if (!isOfflineOrServerError(err)) {
          setErrorMsg(
            err instanceof Error
              ? err.message
              : lang === 'vi'
                ? 'Thông tin đăng nhập hoặc mật khẩu không chính xác.'
                : 'Invalid email/phone or password.'
          );
          return;
        }
      } finally {
        setIsSubmittingLogin(false);
      }
    }

    // Fallback offline demo khi Backend không chạy hoặc đăng nhập bằng SĐT demo
    if (variant === 'modal') {
      const matchedUser = findUserByIdentifier(registeredUsers, cleanId);
      if (matchedUser) {
        if (matchedUser.passwordHash !== loginPassword) {
          setErrorMsg(
            lang === 'vi'
              ? 'Mật khẩu không chính xác. Vui lòng kiểm tra lại.'
              : 'Incorrect password. Please try again.'
          );
          return;
        }
        onLoginSuccess(matchedUser);
        onCloseModal?.();
        return;
      }

      onLoginSuccess(
        buildModalFallbackUser(cleanId, normalizedPhoneId, loginPassword, lang)
      );
      onCloseModal?.();
      return;
    }

    if (
      (cleanId === CONTACT_INFO.email.toLowerCase() ||
        normalizedPhoneId === '0337203332') &&
      loginPassword === '123456'
    ) {
      handleGmailAccountSelect({
        fullName: CONTACT_INFO.personName,
        email: CONTACT_INFO.email,
        phone: '0337203332',
      });
      return;
    }

    const matchedUser = findUserByIdentifier(registeredUsers, cleanId);
    if (!matchedUser || matchedUser.passwordHash !== loginPassword) {
      setErrorMsg(
        lang === 'vi'
          ? 'Thông tin đăng nhập hoặc mật khẩu không chính xác.'
          : 'Invalid email/phone or password.'
      );
      return;
    }
    onLoginSuccess(matchedUser);
  };

  const handleDemoLogin = () => {
    setErrorMsg('');
    const demoUser = registeredUsers[0] || {
      id: 'user-demo-owner',
      fullName: 'Nguyễn Minh Anh',
      email: 'minhanh@animora.vn',
      phone: '0901234567',
      passwordHash: '123456',
      role: 'owner' as const,
      createdAt: '2026-01-15',
      addresses: [
        {
          id: 'addr-demo-1',
          label: 'Nhà riêng',
          recipientName: 'Nguyễn Minh Anh',
          phone: '0901234567',
          addressLine: '128 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
          isDefault: true,
        },
      ],
    };
    onLoginSuccess(demoUser);
    onCloseModal?.();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPhone = regPhone.trim().replace(/\s+/g, '');

    const validation = validateRegisterInput({
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: regPassword,
      confirmPassword: regConfirmPassword,
      agreedTerms: agreeTerms,
    });
    if (!validation.isValid) {
      setErrorMsg(lang === 'vi' ? validation.errorVi || '' : validation.errorEn || '');
      return;
    }

    setIsSubmittingRegister(true);
    try {
      const beUser = await registerUser({
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: regPassword,
      });
      const mappedUser = mapBackendUserToAccount(beUser, regPassword);
      onRegisterSuccess(mappedUser);
      onCloseModal?.();
      return;
    } catch (err) {
      if (!isOfflineOrServerError(err)) {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : lang === 'vi'
              ? 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.'
              : 'Registration failed. Please check your details.'
        );
        return;
      }
    } finally {
      setIsSubmittingRegister(false);
    }

    // Fallback offline demo khi Backend không khả dụng
    const exists =
      findUserByIdentifier(registeredUsers, cleanEmail) ||
      findUserByIdentifier(registeredUsers, cleanPhone);
    if (exists) {
      setErrorMsg(
        lang === 'vi'
          ? 'Email hoặc số điện thoại này đã được đăng ký.'
          : 'This email or phone number is already registered.'
      );
      return;
    }

    const newUser = buildRegisteredUser({
      fullName: cleanName,
      email: cleanEmail,
      phone: regPhone.trim(),
      password: regPassword,
      includeDefaultAddress: variant === 'modal',
      lang,
    });

    onRegisterSuccess(newUser);
    onCloseModal?.();
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanId = forgotIdentifier.trim().toLowerCase();
    if (!cleanId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanId)) {
      setErrorMsg(
        lang === 'vi'
          ? 'Vui lòng nhập địa chỉ Email hợp lệ đã đăng ký.'
          : 'Please enter a valid registered Email address.'
      );
      return;
    }

    try {
      await forgotPasswordUser(cleanId);
      setForgotOtp('');
      setForgotStep(2);
      setSuccessBanner(
        lang === 'vi'
          ? 'Yêu cầu đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra Email để lấy mã/token xác thực.'
          : 'Password reset request sent! Check your email for the verification code/token.'
      );
      return;
    } catch (err) {
      if (!isOfflineOrServerError(err)) {
        setErrorMsg(err instanceof Error ? err.message : 'Không tìm thấy tài khoản.');
        return;
      }
    }

    if (!hasKnownAccount(registeredUsers, cleanId)) {
      setErrorMsg(
        lang === 'vi'
          ? 'Không tìm thấy tài khoản với thông tin này.'
          : 'No account found with this identifier.'
      );
      return;
    }

    setForgotOtp('');
    setForgotStep(2);
    setSuccessBanner(
      lang === 'vi'
        ? `Mã OTP đã được gửi! (Mã thử nghiệm: ${DEMO_OTP_CODE})`
        : `OTP code sent! (Demo OTP: ${DEMO_OTP_CODE})`
    );
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!forgotOtp.trim() || !forgotNewPass.trim()) {
      setErrorMsg(
        lang === 'vi'
          ? 'Vui lòng nhập mã OTP và mật khẩu mới.'
          : 'Please enter the OTP code and new password.'
      );
      return;
    }
    if (forgotNewPass.length < 6) {
      setErrorMsg(
        lang === 'vi'
          ? 'Mật khẩu mới phải có ít nhất 6 ký tự.'
          : 'New password must be at least 6 characters.'
      );
      return;
    }
    if (forgotNewPass !== forgotConfirmPass) {
      setErrorMsg(
        lang === 'vi'
          ? 'Mật khẩu xác nhận không khớp.'
          : 'Confirmation password does not match.'
      );
      return;
    }

    if (forgotIdentifier.includes('@') && forgotOtp.trim() !== DEMO_OTP_CODE) {
      try {
        await resetPasswordUser(forgotOtp.trim(), forgotNewPass, forgotConfirmPass);
        setSuccessBanner(t.resetSuccessToast);
        setLoginIdentifier(forgotIdentifier.trim());
        setLoginPassword(forgotNewPass);
        setForgotConfirmPass('');
        setForgotNewPass('');
        setForgotOtp('');
        setMode('login');
        onNavigate?.('login');
        return;
      } catch (err) {
        if (!isOfflineOrServerError(err)) {
          setErrorMsg(err instanceof Error ? err.message : 'Đặt lại mật khẩu thất bại.');
          return;
        }
      }
    }

    if (forgotOtp.trim() !== DEMO_OTP_CODE) {
      setErrorMsg(
        lang === 'vi'
          ? `Mã xác thực OTP không chính xác (nhập ${DEMO_OTP_CODE}).`
          : `Invalid OTP code (use ${DEMO_OTP_CODE}).`
      );
      return;
    }

    onResetPasswordSuccess?.(forgotIdentifier.trim(), forgotNewPass);
    setSuccessBanner(t.resetSuccessToast);
    setLoginIdentifier(forgotIdentifier.trim());
    setLoginPassword(forgotNewPass);
    setForgotConfirmPass('');
    setForgotNewPass('');
    setForgotOtp('');
    setMode('login');
    onNavigate?.('login');
  };

  return {
    gmailPickerOpen,
    setGmailPickerOpen,
    customGmailMode,
    setCustomGmailMode,
    customGmailName,
    setCustomGmailName,
    customGmailAddress,
    setCustomGmailAddress,
    customGmailPhone,
    setCustomGmailPhone,
    resetGmailPicker,
    loginIdentifier,
    setLoginIdentifier,
    loginPassword,
    setLoginPassword,
    showLoginPass,
    setShowLoginPass,
    rememberMe,
    setRememberMe,
    isSubmittingLogin,
    regName,
    setRegName,
    regEmail,
    setRegEmail,
    regPhone,
    setRegPhone,
    regPassword,
    setRegPassword,
    regConfirmPassword,
    setRegConfirmPassword,
    showRegPass,
    setShowRegPass,
    showRegConfirmPass,
    setShowRegConfirmPass,
    agreeTerms,
    setAgreeTerms,
    isSubmittingRegister,
    forgotIdentifier,
    setForgotIdentifier,
    forgotOtp,
    setForgotOtp,
    forgotNewPass,
    setForgotNewPass,
    forgotConfirmPass,
    setForgotConfirmPass,
    forgotStep,
    setForgotStep,
    handleGmailAccountSelect,
    handleCustomGmailSubmit,
    handleLoginSubmit,
    handleDemoLogin,
    handleRegisterSubmit,
    handleSendOtp,
    handleResetPassword,
  };
}

export type UseAuthFlowsReturn = ReturnType<typeof useAuthFlows>;
