import React, { useState, useEffect } from 'react';
import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';
import axios from 'axios';
import {loader as welcomePageLoader, WelcomePage} from './components/WelcomePage';
import {loader as onboardingLoader, OnboardingPage} from './components/OnboardingPage';
import AssessmentPage from './components/AssessmentPage';
import LiveAnnotationPage from './components/LiveAnnotationPage';
import ThankYouPage from './components/ThankYouPage';

async function goToNextStage({request}) {
  const participantId = localStorage.getItem('PARTICIPANT_ID');
  const studyId = localStorage.getItem('STUDY_ID');
  const sessionId = localStorage.getItem('SESSION_ID');
  const formData = await request.formData();
  const newStage = formData.get('newStage');
  const init = await axios.post('/api/update-stage', {participantId, studyId, sessionId, newStage})
  return redirect("/" + newStage);
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <WelcomePage/>,
    loader: welcomePageLoader,
    action: goToNextStage
  }, 
  { 
    path: "/onboarding",
    element: <OnboardingPage/>,
    loader: onboardingLoader,
    action: goToNextStage
  },
  {
    path: "/assessment",
    element: <AssessmentPage/>
  },
  {
    path: "/live",
    element: <LiveAnnotationPage/>
  },
  {
    path: "/thank-you",
    element: <ThankYouPage/>

  }
]);
const App = () => <RouterProvider router={router} />;
export { App };