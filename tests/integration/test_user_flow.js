const puppeteer = require('puppeteer');
const backend = 'http://127.0.0.1:5000';

describe('Annotation App Integration Tests', () => {
  let browser;
  let page;
  let expect;

  before(async () => {
    browser = await puppeteer.launch({
      headless: false
    });
    const chai = await import('chai');
    expect = chai.expect;
  });

  after(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  it('1. Full User Flow Test', async () => {
    await page.goto(`${backend}?PROLIFIC_PID=testuser&STUDY_ID=test123&SESSION_ID=abc456`);
    // Welcome page
    await page.waitForSelector('button:contains("Start Onboarding")');
    await page.click('button:contains("Start Onboarding")');

    // Onboarding
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector('button:contains("Next Example")');
      await page.click('button:contains("Next Example")');
    }

    // Assessment
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector('input[type="radio"]');
      await page.click('input[type="radio"]:nth-child(1)');
      await page.click('button:contains("Submit and Next")');
    }

    // Live annotation
    for (let i = 0; i < 10; i++) {
      await page.waitForSelector('input[type="radio"]');
      await page.click('input[type="radio"]:nth-child(1)');
      await page.click('button:contains("Submit and Next")');
    }

    // Thank you page
    await page.waitForSelector('h1:contains("Thank You for Participating!")');
    const completionCode = await page.$eval('.alert-success h2', el => el.textContent);
    expect(completionCode).to.match(/^[A-Z0-9]{8}$/);
  });

  it('2. Participant Initialization', async () => {
    await page.goto(`${backend}?PROLIFIC_PID=testuser2&STUDY_ID=test456&SESSION_ID=def789`);
    await page.waitForSelector('h1:contains("Welcome to the Annotation Study")');
    
    // Check database for correct initialization (this would require an API endpoint)
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/participant-status?id=testuser2');
      return res.json();
    });
    
    expect(response.currentStage).to.equal('welcome');
  });

  it('3. Onboarding Flow', async () => {
    await page.goto(`${backend}/onboarding?participantId=testuser3`);
    
    let exampleCount = 0;
    while (true) {
      await page.waitForSelector('button:contains("Next Example")');
      const buttonText = await page.$eval('button', el => el.textContent);
      if (buttonText === 'Start Assessment') break;
      await page.click('button:contains("Next Example")');
      exampleCount++;
    }
    
    expect(exampleCount).to.equal(5);
    expect(await page.$('.explanations')).to.not.be.null;
  });

  it('4. Assessment Flow', async () => {
    await page.goto(`${backend}/assessment?participantId=testuser4`);
    
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector('input[type="radio"]');
      // Alternating between correct (5) and incorrect (1) answers
      await page.click(i % 2 === 0 ? 'input[type="radio"]:nth-child(5)' : 'input[type="radio"]:nth-child(1)');
      await page.click('button:contains("Submit and Next")');
    }
    
    await page.waitForSelector('.alert');
    const alertText = await page.$eval('.alert', el => el.textContent);
    expect(alertText).to.include('Your score: 60%');
    expect(alertText).to.include("you didn't pass the assessment");
  });

  it('5. Live Annotation Flow', async () => {
    await page.goto(`${backend}/live?participantId=testuser5`);
    
    let taskCount = 0;
    while (true) {
      await page.waitForSelector('input[type="radio"]');
      await page.click('input[type="radio"]:nth-child(3)');
      const buttonText = await page.$eval('button', el => el.textContent);
      if (buttonText === 'Submit and Finish') {
        await page.click('button');
        break;
      }
      await page.click('button:contains("Submit and Next")');
      taskCount++;
    }
    
    expect(taskCount).to.equal(9);  // 10 tasks total, but we break on the last one
    await page.waitForSelector('h1:contains("Thank You for Participating!")');
  });

  it('6. Screened Out Flow', async () => {
    await page.goto(`${backend}/assessment?participantId=testuser6`);
    
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector('input[type="radio"]');
      await page.click('input[type="radio"]:nth-child(1)');  // Always choosing the first (incorrect) option
      await page.click('button:contains("Submit and Next")');
    }
    
    await page.waitForSelector('.alert-danger');
    const alertText = await page.$eval('.alert-danger', el => el.textContent);
    expect(alertText).to.include("you didn't pass the assessment");
    
    // Check if redirected to Prolific screen-out URL
    await page.waitForNavigation();
    expect(page.url()).to.include('PROLIFIC_SCREEN_OUT_URL');
  });

  it('7. Completion Code Generation', async () => {
    await page.goto(`${backend}/thank-you?participantId=testuser7`);
    
    await page.waitForSelector('.alert-success h2');
    const completionCode = await page.$eval('.alert-success h2', el => el.textContent);
    expect(completionCode).to.match(/^[A-Z0-9]{8}$/);
    
    // Check if redirected to Prolific completion URL
    await page.waitForNavigation();
    expect(page.url()).to.include('PROLIFIC_COMPLETION_URL');
  });

  it('8. Data Persistence', async () => {
    // This test would require API endpoints to check data persistence
    // Here's a basic structure:
    
    await page.goto(`${backend}?PROLIFIC_PID=testuser8&STUDY_ID=test789&SESSION_ID=ghi012`);
    
    // Submit data at each stage
    // ... (similar to previous tests)
    
    // Check data persistence (assuming an API endpoint exists)
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/participant-data?id=testuser8');
      return res.json();
    });
    
    expect(response.onboardingComplete).to.be.true;
    expect(response.assessmentScore).to.exist;
    expect(response.liveAnnotations).to.have.length.greaterThan(0);
  });

  it('9. Error Handling', async () => {
    // Test invalid Prolific parameters
    await page.goto(`${backend}?PROLIFIC_PID=invalid`);
    await page.waitForSelector('.error-message');
    let errorText = await page.$eval('.error-message', el => el.textContent);
    expect(errorText).to.include('Invalid Prolific parameters');
    
    // Attempt to access stages out of order
    await page.goto(`${backend}/assessment`);
    errorText = await page.$eval('.error-message', el => el.textContent);
    expect(errorText).to.include('Please complete the onboarding first');
    
    // Submit incomplete annotation
    await page.goto(`${backend}/live?participantId=testuser9`);
    await page.click('button:contains("Submit and Next")');
    errorText = await page.$eval('.error-message', el => el.textContent);
    expect(errorText).to.include('Please answer all questions');
  });
});
