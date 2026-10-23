@Dashboard @regression
Feature: Dashboard Menu

    Background:
        Given the user navigates to the OrangeHRM login page

    @UI @smoke @dashboard
    Scenario: DASH-01 Verify all dashboard menu elements are displayed correctly
        When the user enters username "Admin"
        And the user enters password "admin123"
        And clicks on Login button
        Then the user should be redirected to Dashboard page
        Then the user should see the following dashboard menu "<menuOption>"
        Examples:
            | menuOption  |
            | Admin       |
            | PIM         |
            | Leave       |
            | Time        |
            | Recruitment |
            | My Info     |
            | Performance |
            | Dashboard   |
            | Directory   |
            | Maintenance |
            | Claim       |
            | Buzz        |

    @UI @dashboard 
    Scenario: DASH-02 Verify the search functionality in the dashboard menu
        When the user enters username "Admin"
        And the user enters password "admin123"
        And clicks on Login button
        Then the user should be redirected to Dashboard page
        When the user searches for "<searchItem>" in the dashboard menu
        Then the user should see the search results containing "<searchItem>"
        Examples:
            | searchItem |
            | Admin      |
            | PIM        |
            | Leave      |
            | Time       |
            | Recruitment|
            | My Info    |
            | Performance|
            | Dashboard  |
            | Directory  |
            | Maintenance|
            | Claim      |
            | Buzz       |

    @UI @dashboard @hide
    Scenario: DASH-03 Verify the functionality of the Hide button in the dashboard menu
        When the user enters username "Admin"
        And the user enters password "admin123"
        And clicks on Login button
        Then the user should be redirected to Dashboard page
        When the user clicks on the Hide button in the dashboard menu
        Then the dashboard menu should be hidden from view
    