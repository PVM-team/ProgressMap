require 'rails_helper'

describe "Map page" do

  it "shows the page correctly", js: true do
    visit "/#/"
    save_and_open_page
    expect(page).to have_content "Assignments"
    expect(page).to have_content "Participants"
    expect(page).to have_content "Locations"
  end

  it "adds user to course", js: true do
    visit "/#/"
    save_and_open_page
    click_button("Add user to course")
    expect(page).to have_content "{"
  end

end