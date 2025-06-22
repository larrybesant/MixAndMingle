"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QATestSuite = void 0;
const test_1 = require("@playwright/test");
class QATestSuite {
    constructor() {
        this.baseUrl = 'http://localhost:3001';
        this.testEmail = `qa.test.${Date.now()}@example.com`;
        this.testPassword = 'QATest123!';
        this.testResults = [];
    }
    async init(browser) {
        this.browser = browser;
        this.page = await browser.newPage();
        // Log all console messages and errors
        this.page.on('console', msg => {
            console.log(`🟦 CONSOLE [${msg.type()}]: ${msg.text()}`);
            if (msg.type() === 'error') {
                this.logIssue('console_error', `Console error: ${msg.text()}`);
            }
        });
        this.page.on('pageerror', error => {
            console.log(`🔴 PAGE ERROR: ${error.message}`);
            this.logIssue('page_error', `Page error: ${error.message}`);
        });
        this.page.on('response', response => {
            if (!response.ok() && response.status() !== 404) {
                console.log(`🟡 HTTP ERROR: ${response.status()} ${response.url()}`);
                if (response.status() === 405) {
                    this.logIssue('405_error', `405 Method Not Allowed: ${response.url()}`);
                }
            }
        });
    }
    logIssue(type, message, severity = 'medium') {
        const issue = {
            type,
            message,
            severity,
            timestamp: new Date().toISOString(),
            url: this.page.url()
        };
        this.testResults.push(issue);
        console.log(`🚨 [${severity.toUpperCase()}] ${type}: ${message}`);
    }
    async testLandingPage() {
        console.log('🧪 Testing Landing Page...');
        try {
            await this.page.goto(this.baseUrl);
            await this.page.waitForLoadState('networkidle');
            // Check if the page loads
            await (0, test_1.expect)(this.page).toHaveTitle(/Mix.*Mingle/i);
            // Check for main elements
            const hasSignInButton = await this.page.locator('text=Sign In').isVisible();
            const hasBrowseRooms = await this.page.locator('text=Browse Rooms').isVisible();
            const hasGoLive = await this.page.locator('text=Go Live').isVisible();
            if (!hasSignInButton)
                this.logIssue('missing_element', 'Sign In button not found', 'medium');
            if (!hasBrowseRooms)
                this.logIssue('missing_element', 'Browse Rooms button not found', 'medium');
            if (!hasGoLive)
                this.logIssue('missing_element', 'Go Live button not found', 'medium');
            console.log('✅ Landing page test completed');
        }
        catch (error) {
            this.logIssue('landing_page_error', `Landing page failed to load: ${error}`, 'critical');
        }
    }
    async testSignUpFlow() {
        console.log('🧪 Testing Sign Up Flow...');
        try {
            // Navigate to signup
            await this.page.click('text=Sign In');
            await this.page.waitForLoadState('networkidle'); // Look for signup link
            await this.page.waitForTimeout(2000);
            const signupLink = this.page.locator('text=Sign up');
            if (await signupLink.isVisible()) {
                await signupLink.click();
            }
            else {
                // Try alternative navigation
                await this.page.goto(`${this.baseUrl}/signup`);
            }
            await this.page.waitForLoadState('networkidle');
            // Fill signup form
            const emailField = this.page.locator('input[type=\"email\"]');
            const passwordField = this.page.locator('input[type=\"password\"]').first();
            const submitButton = this.page.locator('button[type=\"submit\"], button:has-text(\"Sign Up\")');
            if (await emailField.isVisible()) {
                await emailField.fill(this.testEmail);
                await passwordField.fill(this.testPassword);
                // Look for additional fields
                const usernameField = this.page.locator('input[placeholder*=\"username\" i]');
                if (await usernameField.isVisible()) {
                    await usernameField.fill(`qauser${Date.now()}`);
                }
                await submitButton.click();
                await this.page.waitForTimeout(3000);
                // Check for success or error messages
                const hasError = await this.page.locator('.text-red-400, .bg-red-500').isVisible();
                const hasSuccess = await this.page.locator('.text-green-400, .bg-green-500').isVisible();
                if (hasError) {
                    const errorText = await this.page.locator('.text-red-400, .bg-red-500').textContent();
                    this.logIssue('signup_error', `Signup failed: ${errorText}`, 'high');
                }
                else if (hasSuccess) {
                    console.log('✅ Signup appears successful');
                }
            }
            else {
                this.logIssue('missing_form', 'Signup form not found', 'high');
            }
        }
        catch (error) {
            this.logIssue('signup_flow_error', `Signup flow failed: ${error}`, 'high');
        }
    }
    async testPasswordResetFlow() {
        console.log('🧪 Testing Password Reset Flow...');
        try {
            // Navigate to forgot password
            await this.page.goto(`${this.baseUrl}/forgot-password`);
            await this.page.waitForLoadState('networkidle');
            const emailField = this.page.locator('input[type=\"email\"]');
            const submitButton = this.page.locator('button:has-text(\"Send Reset Link\"), button[type=\"submit\"]');
            if (await emailField.isVisible()) {
                await emailField.fill(this.testEmail);
                await submitButton.click();
                await this.page.waitForTimeout(3000);
                // Check for 405 error specifically
                const hasError = await this.page.locator('.text-red-400').isVisible();
                if (hasError) {
                    const errorText = await this.page.locator('.text-red-400').textContent();
                    if (errorText?.includes('405')) {
                        this.logIssue('405_error', 'Password reset returning 405 error', 'critical');
                    }
                }
                console.log('✅ Password reset flow tested');
            }
        }
        catch (error) {
            this.logIssue('password_reset_error', `Password reset failed: ${error}`, 'high');
        }
    }
    async testNavigationAndPages() {
        console.log('🧪 Testing Navigation and Pages...');
        const pagesToTest = [
            { path: '/discover', name: 'Discover' },
            { path: '/dashboard', name: 'Dashboard' },
            { path: '/profile', name: 'Profile' },
            { path: '/messages', name: 'Messages' },
            { path: '/notifications', name: 'Notifications' },
            { path: '/settings', name: 'Settings' },
            { path: '/go-live', name: 'Go Live' }
        ];
        for (const page of pagesToTest) {
            try {
                await this.page.goto(`${this.baseUrl}${page.path}`);
                await this.page.waitForLoadState('networkidle', { timeout: 10000 });
                const hasContent = await this.page.locator('body').isVisible();
                if (!hasContent) {
                    this.logIssue('page_load_error', `${page.name} page failed to load content`, 'medium');
                }
                // Check for auth redirects
                const currentUrl = this.page.url();
                if (currentUrl.includes('/login') && !page.path.includes('/login')) {
                    console.log(`ℹ️ ${page.name} requires authentication (redirected to login)`);
                }
            }
            catch (error) {
                this.logIssue('navigation_error', `Failed to navigate to ${page.name}: ${error}`, 'medium');
            }
        }
    }
    async testAPIEndpoints() {
        console.log('🧪 Testing API Endpoints...');
        const endpoints = [
            { path: '/api/health', method: 'GET' },
            { path: '/api/auth/reset-password', method: 'GET' },
            { path: '/api/webhooks/auth', method: 'GET' },
            { path: '/api/fix-auth-405', method: 'GET' }
        ];
        for (const endpoint of endpoints) {
            try {
                const response = await this.page.request.get(`${this.baseUrl}${endpoint.path}`);
                if (response.status() === 405) {
                    this.logIssue('405_error', `405 error on ${endpoint.path}`, 'high');
                }
                else if (!response.ok() && response.status() !== 404) {
                    this.logIssue('api_error', `API error ${response.status()} on ${endpoint.path}`, 'medium');
                }
            }
            catch (error) {
                this.logIssue('api_test_error', `Failed to test ${endpoint.path}: ${error}`, 'low');
            }
        }
    }
    async generateReport() {
        console.log('\\n📊 QA TEST REPORT');
        console.log('==================');
        const criticalIssues = this.testResults.filter(r => r.severity === 'critical');
        const highIssues = this.testResults.filter(r => r.severity === 'high');
        const mediumIssues = this.testResults.filter(r => r.severity === 'medium');
        const lowIssues = this.testResults.filter(r => r.severity === 'low');
        console.log(`\\n🔴 Critical Issues: ${criticalIssues.length}`);
        criticalIssues.forEach(issue => {
            console.log(`  - ${issue.type}: ${issue.message}`);
        });
        console.log(`\\n🟠 High Priority Issues: ${highIssues.length}`);
        highIssues.forEach(issue => {
            console.log(`  - ${issue.type}: ${issue.message}`);
        });
        console.log(`\\n🟡 Medium Priority Issues: ${mediumIssues.length}`);
        mediumIssues.forEach(issue => {
            console.log(`  - ${issue.type}: ${issue.message}`);
        });
        console.log(`\\n🟢 Low Priority Issues: ${lowIssues.length}`);
        lowIssues.forEach(issue => {
            console.log(`  - ${issue.type}: ${issue.message}`);
        });
        // Return structured results for fixing
        return {
            critical: criticalIssues,
            high: highIssues,
            medium: mediumIssues,
            low: lowIssues,
            total: this.testResults.length
        };
    }
    async runFullTestSuite() {
        console.log('🚀 Starting Full QA Test Suite...');
        await this.testLandingPage();
        await this.testSignUpFlow();
        await this.testPasswordResetFlow();
        await this.testNavigationAndPages();
        await this.testAPIEndpoints();
        const report = await this.generateReport();
        await this.page.close();
        return report;
    }
}
exports.QATestSuite = QATestSuite;
