require 'rails_helper'

describe "Course creation page", js: true do

 before :all do
   self.use_transactional_fixtures = false
 end

 before :each do
   DatabaseCleaner.strategy = :truncation
   DatabaseCleaner.start
 end

 after :each do
   DatabaseCleaner.clean
 end

 after :all do
   self.use_transactional_fixtures = true
 end

 describe 'when course creation page is opened' do

   before :each do
     visit_course_creation_page
     @button = page.find("button")

     FactoryGirl.create :user
     FactoryGirl.create :user, firstName: "Erkki", lastName: "Mäkelä"
   end

   it 'it has a disabled submit button' do
     expect(@button.visible?).to be(true)
     expect(@button[:disabled]).to eq("true")
   end

   it 'when course name is given a valid value and assignment count an invalid value, submit button is disabled' do
      fill_in('courseName', with:'course')
      fill_in('assignmentCount', with:'501')
      expect(@button[:disabled]).to eq("true")
   end

   it 'when course name is given an invalid value and assignment count a valid value, submit button is disabled' do
      fill_in('courseName', with:'c')
      fill_in('assignmentCount', with:'300')
      expect(@button[:disabled]).to eq("true")
   end

   it 'when course name and assignment count are given valid values, submit button is disabled' do
      fill_in('courseName', with:'course')
      fill_in('assignmentCount', with:'300')
      expect(@button[:disabled]).to be(nil)
   end

   it "when submit button is enabled and it is clicked" do 
      fill_in('courseName', with:'makkara')
      fill_in('assignmentCount', with:'3')
      click_button 'Submit'

      expect(page).to have_content 'Course: makkara'
      expect(page.find("button", :text => '1'))
   end

   it "when filling courseName with invalid value, displays error message" do
    fill_in('courseName', with:'m')
    fill_in('assignmentCount', with:'100')

    page.first('button', :text => 'Submit')
    expect(page).to have_content('Course name should have')
   end

  it "when filling assignmentCount with invalid value, displays error message" do
    fill_in('assignmentCount', with:'-1')
    fill_in('courseName', with:'makkara')

    page.first('button', :text => 'Submit')
    expect(page).to have_content('Number should be between')
   end
 end
end

def visit_course_creation_page
 visit '/'
 click_button 'Create a new course'
end