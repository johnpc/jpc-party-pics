Feature: Navigation
  As a user
  I want clear navigation throughout the app
  So that I can easily move between different views

  Scenario: Header shows on all pages
    Given I am on the home page
    Then I should see the app header

  Scenario: Clicking header logo returns to home
    Given I navigate to album "wedding"
    When I click the header
    Then I should be redirected to "/"

  Scenario: Direct URL navigation to album
    Given I navigate to "/my-event"
    Then I should see the album page for "my-event"

  Scenario: Direct URL navigation to camera
    Given I navigate to "/my-event/camera"
    Then I should see the camera page

  Scenario: Direct URL navigation to kiosk
    Given I navigate to "/my-event/kiosk"
    Then I should see the kiosk view
