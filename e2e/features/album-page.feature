Feature: Album Page
  As an event attendee
  I want to access an album page
  So that I can upload and view shared photos

  Scenario: Album page shows QR code after clicking Share
    Given I navigate to album "wedding"
    When I click "🔗 Share"
    Then I should see a QR code

  Scenario: Album page shows file upload area
    Given I navigate to album "wedding"
    Then I should see the upload hero area

  Scenario: Album page shows camera button
    Given I navigate to album "wedding"
    Then I should see a button "📸 Camera"

  Scenario: Camera button navigates to camera mode
    Given I navigate to album "wedding"
    When I click "📸 Camera"
    Then I should be redirected to "/wedding/camera"

  Scenario: Album page shows copy link buttons after Share
    Given I navigate to album "wedding"
    When I click "🔗 Share"
    Then I should see a button "Copy Album Link"
    And I should see a button "Copy Kiosk Link"

  Scenario: Copy link shows confirmation
    Given I navigate to album "wedding"
    When I click "🔗 Share"
    And I click "Copy Album Link"
    Then the button should briefly show a checkmark
