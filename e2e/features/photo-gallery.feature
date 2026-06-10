Feature: Photo Gallery
  As an event attendee
  I want to view and manage shared photos
  So that I can enjoy and download event memories

  Scenario: Empty album shows no photos message
    Given I navigate to an album with no photos
    Then I should see "No photos yet"

  Scenario: Album with photos shows image grid
    Given I navigate to an album with photos
    Then I should see photos in a grid layout
    And photos should be sorted newest first

  Scenario: Clicking a photo opens modal
    Given I navigate to an album with photos
    When I click on a photo
    Then I should see the photo modal
    And I should see navigation arrows
    And I should see a download button
    And I should see a delete button

  Scenario: Navigating forward in modal
    Given the photo modal is open
    When I click the forward arrow
    Then I should see the next photo

  Scenario: Navigating backward in modal
    Given the photo modal is open
    When I click the back arrow
    Then I should see the previous photo

  Scenario: Closing the modal
    Given the photo modal is open
    When I click outside the modal
    Then the modal should close

  Scenario: Download individual photo
    Given the photo modal is open
    When I click the download button
    Then the photo should open in a new tab

  Scenario: Delete photo with confirmation
    Given the photo modal is open
    When I confirm and delete the photo
    Then the photo should be removed from the album

  Scenario: Cancel delete does not remove photo
    Given the photo modal is open
    When I dismiss and click delete
    Then the photo should still be in the album

  Scenario: Download all as zip
    Given I navigate to an album with photos
    When I confirm and click download all
    Then a zip file should begin downloading

  Scenario: Paginated gallery for many photos
    Given I navigate to an album with more than 24 photos
    Then I should see pagination controls
    And I should see 24 photos per page
