@Admin @regression
Feature: Admin / User Management Page

  Background:
    Given the user navigates to the OrangeHRM login page

  # ==================== Navigation & Page Load ====================

  @UI @smoke @admin
  Scenario: ADMIN-01 Verify Admin page loads after clicking Admin menu
    Given the user logs in with credentials for user ID "1"
    And clicks on Login button
    Then the user should be redirected to Dashboard page
    When the user clicks on the Admin menu
    Then the Admin page should be displayed

  @UI @admin
  Scenario: ADMIN-02 Verify Admin page title is displayed correctly
    Given the user logs in with credentials for user ID "1"
    And clicks on Login button
    Then the user should be redirected to Dashboard page
    When the user clicks on the Admin menu
    Then the Admin page title should be "Admin"

  @UI @admin
  Scenario Outline: ADMIN-03 Verify all top navigation tabs are visible on Admin page
    Given the user logs in with credentials for user ID "1"
    And clicks on Login button
    Then the user should be redirected to Dashboard page
    When the user clicks on the Admin menu
    Then the following admin navigation tabs should be visible "<tab>"

    Examples:
      | tab                |
      | User Management    |
      | Job                |
      | Organization       |
      | Qualifications     |
      | Nationalities      |
      | Corporate Branding |
      | Configuration      |

  # ==================== System Users Search ====================

  @Search @smoke @admin
  Scenario: ADMIN-04 Search system users by Username
    Given the user logs in with credentials for user ID "1"
    And clicks on Login button
    Then the user should be redirected to Dashboard page
    When the user clicks on the Admin menu
    And the user enters "Admin" in the Username search field
    And the user clicks the Search button on Admin page
    Then the search results should be displayed on Admin page

  @Search @admin
  Scenario Outline: ADMIN-05 Search system users by User Role
    Given the user logs in with credentials for user ID "1"
    And clicks on Login button
    Then the user should be redirected to Dashboard page
    When the user clicks on the Admin menu
    And the user selects "<role>" from the User Role dropdown
    And the user clicks the Search button on Admin page
    Then the search results should be displayed on Admin page

    Examples:
      | role  |
      | Admin |
      | ESS   |

  @Search @admin
  Scenario: ADMIN-06 Search system users by Employee Name
    Given the user logs in with credentials for user ID "1"
    And clicks on Login button
    Then the user should be redirected to Dashboard page
    When the user clicks on the Admin menu
    And the user enters "John" in the Employee Name search field
    And the user clicks the Search button on Admin page
    Then the search results should be displayed on Admin page

  @Search @admin
  Scenario Outline: ADMIN-07 Search system users by Status
    Given the user logs in with credentials for user ID "1"
    And clicks on Login button
    Then the user should be redirected to Dashboard page
    When the user clicks on the Admin menu
    And the user selects "<status>" from the Status dropdown
    And the user clicks the Search button on Admin page
    Then the search results should be displayed on Admin page

    Examples:
      | status   |
      | Enabled  |
      | Disabled |

  @Search @admin
  Scenario: ADMIN-08 Search with no filters returns all records
    Given the user logs in with credentials for user ID "1"
    And clicks on Login button
    Then the user should be redirected to Dashboard page
    When the user clicks on the Admin menu
    And the user clicks the Search button on Admin page
    Then the search results should be displayed on Admin page

  @Search @admin
  Scenario: ADMIN-09 Reset button clears all search filters
    Given the user logs in with credentials for user ID "1"
    And clicks on Login button
    Then the user should be redirected to Dashboard page
    When the user clicks on the Admin menu
    And the user enters "Admin" in the Username search field
    And the user clicks the Reset button on Admin page
    Then the Admin search filters should be cleared

  @Search @admin
  Scenario: ADMIN-10 Search with invalid username returns no results
    Given the user logs in with credentials for user ID "1"
    And clicks on Login button
    Then the user should be redirected to Dashboard page
    When the user clicks on the Admin menu
    And the user enters "InvalidUserXYZ123" in the Username search field
    And the user clicks the Search button on Admin page
    Then no records should be found on Admin page

  # ==================== User Records Table ====================

  @UI @admin
  Scenario Outline: ADMIN-11 Verify records table columns are displayed correctly
    Given the user logs in with credentials for user ID "1"
    And clicks on Login button
    Then the user should be redirected to Dashboard page
    When the user clicks on the Admin menu
    Then the Admin records table should display the following columns "<column>"

    Examples:
      | column        |
      | Username      |
      | User Role     |
      | Employee Name |
      | Status        |
      | Actions       |

  @UI @smoke @admin
  Scenario: ADMIN-12 Verify total record count is displayed
    Given the user logs in with credentials for user ID "1"
    And clicks on Login button
    Then the user should be redirected to Dashboard page
    When the user clicks on the Admin menu
    Then the Admin page should display the total records count

  # ==================== Add User ====================

  @AddUser @smoke @admin
  Scenario: ADMIN-13 Verify clicking Add button opens the Add User form
    Given the user logs in with credentials for user ID "1"
    And clicks on Login button
    Then the user should be redirected to Dashboard page
    When the user clicks on the Admin menu
    And the user clicks the Add button on Admin page
    Then the Add User form should be displayed

  @AddUser @admin
  Scenario: ADMIN-14 Verify validation when Add User form is submitted empty
    Given the user logs in with credentials for user ID "1"
    And clicks on Login button
    Then the user should be redirected to Dashboard page
    When the user clicks on the Admin menu
    And the user clicks the Add button on Admin page
    And the user clicks the Save button on Add User form
    Then the required validation message should be displayed

  # ==================== Edit User ====================

  @EditUser @smoke @admin
  Scenario: ADMIN-15 Verify clicking edit icon opens the Edit User form
    Given the user logs in with credentials for user ID "1"
    And clicks on Login button
    Then the user should be redirected to Dashboard page
    When the user clicks on the Admin menu
    And the user clicks the Search button on Admin page
    And the user clicks the edit icon for the first record on Admin page
    Then the Edit User form should be displayed

  # ==================== Delete User ====================

  @DeleteUser @admin
  Scenario: ADMIN-16 Verify clicking delete icon shows confirmation dialog
    Given the user logs in with credentials for user ID "1"
    And clicks on Login button
    Then the user should be redirected to Dashboard page
    When the user clicks on the Admin menu
    And the user clicks the Search button on Admin page
    And the user clicks the delete icon for the first record on Admin page
    Then the delete confirmation dialog should be displayed

  @DeleteUser @admin
  Scenario: ADMIN-17 Verify Cancel on delete confirmation keeps user in list
    Given the user logs in with credentials for user ID "1"
    And clicks on Login button
    Then the user should be redirected to Dashboard page
    When the user clicks on the Admin menu
    And the user clicks the Search button on Admin page
    And the user clicks the delete icon for the first record on Admin page
    And the user clicks Cancel on the delete confirmation dialog
    Then the search results should be displayed on Admin page
