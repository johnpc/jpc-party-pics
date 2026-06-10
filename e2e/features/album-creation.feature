Feature: Album Creation
  As a user
  I want to create a new photo album
  So that I can share photos from my event

  Scenario: Landing page shows app description
    Given I am on the home page
    Then I should see "Free zero-registration collaborative photo album"
    And I should see a link to the demo album

  Scenario: Landing page shows create album form
    Given I am on the home page
    Then I should see the heading "Create a New Album"
    And I should see an input field with placeholder "my-party"
    And the create button should be disabled

  Scenario: Cannot create album with spaces in name
    Given I am on the home page
    When I type "my party" in the album name input
    Then the create button should be disabled

  Scenario: Cannot create album with duplicate name
    Given I am on the home page
    And I wait for albums to load
    When I type "Demo" in the album name input
    Then the create button should be disabled

  Scenario: Can create album with valid name
    Given I am on the home page
    When I type "my-birthday" in the album name input
    Then the create button should be enabled

  Scenario: Creating album redirects to album page
    Given I am on the home page
    When I type "new-event" in the album name input
    And I click the create button
    Then I should be redirected to "/new-event"
