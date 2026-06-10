Feature: Kiosk Mode
  As an event host
  I want a display-only view of my album
  So that I can show photos on a large screen at my event

  Scenario: Kiosk mode shows photos without upload controls
    Given I navigate to "/wedding/kiosk"
    Then I should see photos in a grid layout
    And I should not see the file uploader
    And I should not see the QR code
    And I should not see the camera button

  Scenario: Kiosk mode shows no album title
    Given I navigate to "/wedding/kiosk"
    Then I should not see the album name as a heading

  Scenario: Kiosk mode updates in real-time
    Given I am viewing "/wedding/kiosk"
    When a new photo is uploaded to the album
    Then the photo should appear in the kiosk view

  Scenario: Empty kiosk shows no photos message
    Given I navigate to an empty album's kiosk
    Then I should see "No photos yet"

  Scenario: Kiosk shows images and videos
    Given I navigate to a kiosk with mixed media
    Then images should display as thumbnails
    And videos should autoplay muted in a loop
