@login @regression
Feature: OrangeHRM Login Page

  Background:
    Given the user navigates to the OrangeHRM login page

  @UI @smoke
  Scenario: LOGIN-01 Verify all login page elements are displayed correctly
    Then the Login page should be displayed
    And the Login title should be visible
    And the company branding image should be visible
    And the OrangeHRM logo should be visible
    And the Username field should be visible
    And the Password field should be visible
    And the Login button should be visible
    And the Forgot Password link should be visible
    And the demo credentials section should be displayed
    And the application version should be displayed
    And the copyright information should be displayed

  @FieldValidation
  Scenario: LOGIN-02 Verify login form field properties
    Then the Username field placeholder should be "Username"
    And the Password field placeholder should be "Password"
    And the Username field should be focused by default
    And the Password field type should be "password"
    And the Username field should have label "Username"
    And the Password field should have label "Password"

  @PositiveLogin @smoke
  Scenario: LOGIN-03 Verify successful login with valid credentials
    When the user enters username "Admin"
    And the user enters password "admin123"
    And clicks on Login button
    Then the user should be redirected to Dashboard page

  @NegativeLogin @smoke
  Scenario Outline: LOGIN-04 Verify invalid login attempts
    When the user enters username "<username>"
    And the user enters password "<password>"
    And clicks on Login button
    Then an invalid credentials error message should be displayed

    Examples:
      | username      | password      |
      | InvalidUser   | admin123      |
      | Admin         | WrongPassword |
      | InvalidUser   | WrongPassword |
      | admin         | admin123      |

  @MandatoryFields @smoke
  Scenario Outline: LOGIN-05 Verify mandatory field validations
    When the user enters username "<username>"
    And the user enters password "<password>"
    And clicks on Login button
    Then the required validation message should be displayed

    Examples:
      | username    | password |
      |             | admin123 |
      | Admin       |          |
      |             |          |

  @ForgotPassword
  Scenario: LOGIN-06 Verify forgot password navigation
    When the user clicks the Forgot Password link
    Then the user should be redirected to Forgot Password page

  @Keyboard
  Scenario: LOGIN-07 Verify keyboard accessibility on login page
    Then the Username field should be focused by default
    When the user presses Tab key
    Then the Password field should receive focus
    When the user presses Tab key again
    Then the Login button should receive focus

  @Keyboard
  Scenario: LOGIN-08 Verify login using Enter key
    When the user enters username "Admin"
    And the user enters password "admin123"
    And presses Enter key
    Then the user should be redirected to Dashboard page

  @FooterLinks
  Scenario: LOGIN-09 Verify social media links are available
    Then LinkedIn icon should be displayed
    And Facebook icon should be displayed
    And Twitter icon should be displayed
    And YouTube icon should be displayed

  @FooterLinks
  Scenario Outline: LOGIN-10 Verify social media navigation
    When the user clicks "<socialMedia>" icon
    Then the respective page should open in a new tab

    Examples:
      | socialMedia |
      | LinkedIn    |
      | Facebook    |
      | Twitter     |
      | YouTube     |

  @Security
  Scenario: LOGIN-11 Verify login form security attributes
    Then the login form method should be "POST"
    And the login form action should contain "/auth/validate"
    And the CSRF token should be present
    And the Password field should be masked

  @Accessibility
  Scenario: LOGIN-12 Verify image accessibility attributes
    Then the company branding image should have alt text "company-branding"
    And the logo image should have alt text "orangehrm-logo"
    And all interactive elements should be keyboard accessible
