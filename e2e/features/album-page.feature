Feature: Album Page
  As an event attendee
  I want to access an album page
  So that I can upload and view shared photos

  Scenario: Album page shows QR code for sharing
    Given I navigate to album "wedding"
    Then I should see a QR code
    And I should see "Share this album link via QR code or copy/paste"

  Scenario: Album page shows file uploader
    Given I navigate to album "wedding"
    Then I should see the file uploader
    And the uploader should accept images and videos

  Scenario: Album page shows camera button
    Given I navigate to album "wedding"
    Then I should see a button "Use In-App Camera"

  Scenario: Camera button navigates to camera mode
    Given I navigate to album "wedding"
    When I click "Use In-App Camera"
    Then I should be redirected to "/wedding/camera"

  Scenario: Album page shows copy link buttons
    Given I navigate to album "wedding"
    Then I should see a button "Copy Album Link"
    And I should see a button "Copy Kiosk Link"

  Scenario: Copy link shows confirmation
    Given I navigate to album "wedding"
    When I click "Copy Album Link"
    Then the button should briefly show a checkmark
