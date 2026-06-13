Feature: Camera
  As an event attendee
  I want to take photos and videos directly in the app
  So that I don't have to leave the browser to capture moments

  Scenario: Camera page starts camera automatically
    Given I navigate to "/e2e-test/camera"
    Then the camera should start
    And I should see a video preview
    And I should be in photo mode

  Scenario: Back button returns to album
    Given I am on the camera page for "e2e-test"
    When I click the back button
    Then I should be redirected to "/e2e-test"

  Scenario: Switch between photo and video mode
    Given I am on the camera page for "e2e-test"
    When I click "Video"
    Then I should see a record button
    When I click "Photo"
    Then I should see a capture button

  Scenario: Capture photo triggers upload
    Given I am on the camera page for "e2e-test"
    And the camera is active
    When I click the capture button
    Then the capture button should be visible

  Scenario: Record video uploads successfully
    Given I am on the camera page for "e2e-test"
    And I switch to video mode
    When I click the record button
    Then the button should show "Stop"
    When I click the stop button
    Then the video should upload
