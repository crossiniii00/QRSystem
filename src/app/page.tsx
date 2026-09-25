"use client";

import React, { useEffect, useState } from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { Footer } from '@/components/common/Footer';
import { Header } from '@/components/common/Header';
import { ConfirmationScreen } from '@/components/student/ConfirmationScreen';
import { EnrollmentWizard } from '@/components/student/EnrollmentWizard';
import { StatusTracker } from '@/components/student/StatusTracker';

interface SubmissionResult {
  referenceNumber: string;
  accessToken: string;
  applicationId: string;
  programName: string;
  studentName: string;
  studentEmail: string;
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<'apply' | 'status' | 'admin'>('apply');
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  // Status tracker pre-population from URL or submission
  const [trackerReference, setTrackerReference] = useState('');
  const [trackerToken, setTrackerToken] = useState('');

  // QR Campaign tracking
  const [detectedCampaignCode, setDetectedCampaignCode] = useState<string | undefined>();
  const [detectedCampaignName, setDetectedCampaignName] = useState<string | undefined>();

  // Admin authentication state
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<{
    id: string;
    email: string;
    fullName: string;
    role: string;
  } | null>(null);

  // Run localStorage access after initial render to avoid SSR hydration mismatch
  useEffect(() => {
    const token = localStorage.getItem('school_admin_token');
    const userStr = localStorage.getItem('school_admin_user');
    if (token) setAdminToken(token);
    if (userStr) {
      try {
        setAdminUser(JSON.parse(userStr));
      } catch (e) {}
    }
  }, []);

  // URL query parameter parsing on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const camp = params.get('camp') || params.get('q');
    const ref = params.get('ref') || params.get('reference');
    const token = params.get('token');
    const tab = params.get('tab');

    if (camp) {
      setDetectedCampaignCode(camp);
      // Backend is not fully migrated to Next.js API routes yet, this will fail gracefully
      fetch(`/api/campaigns/resolve?code=${encodeURIComponent(camp)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setDetectedCampaignName(json.data.name);
          }
        })
        .catch(console.error);
    }

    if (ref && token) {
      setTrackerReference(ref);
      setTrackerToken(token);
      setActiveTab('status');
    } else if (tab === 'status') {
      setActiveTab('status');
    } else if (tab === 'admin') {
      setActiveTab('admin');
    }
  }, []);

  const handleAdminLoginSuccess = (
    token: string,
    user: { id: string; email: string; fullName: string; role: string }
  ) => {
    setAdminToken(token);
    setAdminUser(user);
    localStorage.setItem('school_admin_token', token);
    localStorage.setItem('school_admin_user', JSON.stringify(user));
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('school_admin_token');
    localStorage.removeItem('school_admin_user');
    setActiveTab('apply');
  };

  const handleSubmissionSuccess = (result: SubmissionResult) => {
    setSubmissionResult(result);
    setTrackerReference(result.referenceNumber);
    setTrackerToken(result.accessToken);
  };

  return (
    <div className="min-h-screen relative flex flex-col text-[#261F18] font-sans selection:bg-[#F59E0B] selection:text-[#261F18]">
      {/* Blurred Background Image */}
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/school-bg.jpg)' }}
      >
        <div className="absolute inset-0 bg-[#FAF8F5]/85 backdrop-blur-md" />
      </div>

      {/* Universal Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'apply') setSubmissionResult(null);
        }}
        adminUser={adminUser}
        onLogout={handleAdminLogout}
        activeCampaignName={detectedCampaignName}
      />

      {/* Main Content Viewport */}
      <main className="flex-1">
        {/* PUBLIC TAB: Enrollment Wizard / Confirmation */}
        {activeTab === 'apply' && (
          <>
            {submissionResult ? (
              <ConfirmationScreen
                result={submissionResult}
                onViewStatus={() => {
                  setActiveTab('status');
                }}
              />
            ) : (
              <EnrollmentWizard
                onSubmissionSuccess={handleSubmissionSuccess}
                campaignCode={detectedCampaignCode}
              />
            )}
          </>
        )}

        {/* PUBLIC TAB: Status Tracker */}
        {activeTab === 'status' && (
          <StatusTracker
            initialReference={trackerReference}
            initialToken={trackerToken}
          />
        )}

        {/* ADMIN TAB: Admin Console */}
        {activeTab === 'admin' && (
          <>
            {adminToken && adminUser ? (
              <AdminDashboard
                token={adminToken}
                user={adminUser}
                onLogout={handleAdminLogout}
              />
            ) : (
              <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
            )}
          </>
        )}
      </main>

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}
