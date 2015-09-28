require 'rails_helper'

describe "Course creation page", js: true do

  before :all do
    self.use_transactional_fixtures = false
  end

  before :each do
    DatabaseCleaner.strategy = :truncation
    DatabaseCleaner.start

    FactoryGirl.create :course

    FactoryGirl.create :user
    FactoryGirl.create :user, firstName: "Erkki", lastName: "Mäkelä"
    FactoryGirl.create :user, firstName: "Mauno", lastName: "Tamminen"
    FactoryGirl.create :user, firstName: "Etunimi", lastName: "Sukunimi"
    FactoryGirl.create :user, firstName: "Mauno", lastName: "Tammi"

    visit_course_creation_page
    @button = page.find("button")
  end

  after :each do
    DatabaseCleaner.clean
  end

  after :all do
    self.use_transactional_fixtures = true
  end

  it "has initially a disabled submit button" do
    submit_button_is_disabled
  end


  describe "when course_name is given a valid value and assignment_count an invalid one" do

    before :each do
      fill_course_name_and_assignment_count_with('course', '501')
    end

    it 'submit button is disabled' do
      submit_button_is_disabled
    end

    it 'displays an error message due to invalid assignment_count' do
      expect(page).to have_content('Number should be between')
    end
  end


  describe "when course_name is given an invalid value and assignment_count a valid one" do

    before :each do
      fill_course_name_and_assignment_count_with('c', '50')
    end

    it 'submit button is disabled' do
      submit_button_is_disabled
    end

    it 'displays an error message due to invalid name' do
      expect(page).to have_content('Course name should have')
    end    
  end


  describe "when both course_name assignment_count are given valid values" do

    before :each do
      fill_course_name_and_assignment_count_with('makkara', '3')
    end

    it "submit button is enabled" do
      submit_button_is_enabled
    end

    describe "and course_name is changed to an invalid one" do

      before :each do
        fill_in('courseName', with: '')
      end

      it "submit button is disabled" do
        submit_button_is_disabled
      end

      it "displays an error message due to invalid name" do
        expect(page).to have_content('Course name should have')
      end
    end

    describe "and when submit button is clicked" do

      before :each do
        click_button 'Submit'
      end

      it "it displays the course page of the created course" do
        expect(page).to have_content 'Course: makkara'
      end

      it "there is a button for one of the made assignments in that page" do
        expect(page.find("button", :text => '1'))
      end
    end

    describe "and some users are added to course" do
      
      before :each do
        page.find("a", :text => 'Mauno Tamminen').click
        page.find("a", :text => 'Etunimi Sukunimi').click
      end

      describe "and submit button is clicked" do

        before :each do
          click_button 'Submit'
        end

        it "it displays the course page of the created course" do
          expect(page).to have_content 'Course: makkara'
        end

        it "displays the names of participants of the course" do
          expect(page).to have_content("Mauno")
          expect(page).to have_content('Sukunimi')
        end
      end
    end
  end

  describe "when firstName and/or lastName searches are used" do

    describe "and searched firstName does not match with any student" do

      before do
        fill_first_name_with("Nonexistent-firstname")
      end

      it 'there are no results' do
        resultview_is_empty
      end
    end

    describe "and searched lastName does not match with any student" do

      before do
        fill_last_name_with("Nonexistent-lastname")
      end

      it 'there are no results' do
        resultview_is_empty
      end
    end

    describe "and searched firstName does not match with a student but lastName does" do

      before do
        fill_first_name_with("Erkki")
        fill_last_name_with("Nonexistent-lastname")
      end

      it 'there are no results' do
        resultview_is_empty
      end
    end

    describe "and searched lastName does match with a student but firstName does not" do

      before do
        fill_first_name_with("Nonexistent-firstname")
        fill_last_name_with("Mäkelä")
      end

      it 'there are no results' do
        resultview_is_empty
      end
    end

    describe "and searched firstName matches with students and lastName is not filled" do

      before :each do
        fill_first_name_with("E")
      end

      it "finds the matching students" do
        resultview_include_string("Erkki Mäkelä", true)
        resultview_include_string("Etunimi Sukunimi", true)
      end
    end

    describe "and searched lastName matches with students and firsttName is not filled" do

      before :each do
        fill_last_name_with("T")
      end

      it "finds the matching students" do
        resultview_include_string("Mauno Tamminen", true)
        resultview_include_string("Mauno Tammi", true)
      end
    end

    describe "and both fields together match with some students" do

      before :each do
        fill_first_name_with("Mau")
        fill_last_name_with("Tammi")
      end

      it "finds the matching students" do
        resultview_include_string("Mauno Tamminen", true)
        resultview_include_string("Mauno Tammi", true)
      end
    end  
  end

  describe "when two students are added to to the list of students to be added to the course" do

    before :each do
      expect(find("#participants").text.include?('Mauno Tamminen')).to be(false)

      page.find("a", :text => 'Mauno Tamminen').click
      page.find("a", :text => 'Etunimi Sukunimi').click

      expect(find("#participants").text.include?('Mauno Tamminen')).to be(true)
      expect(find("#participants").text.include?('Etunimi Sukunimi')).to be(true)
    end

    it "neither one of the students can be added again" do
      resultview_include_string("Mauno Tamminen", false)
      resultview_include_string("Etunimi Sukunimi", false)
    end

    describe "and when the first student is removed from that list" do

      before :each do
        remove_buttons = page.all("button", :text => 'Remove')
        expect(remove_buttons.length).to be(2)

        remove_buttons[0].click
        expect(page.all("button", :text => 'Remove').length).to be(1)
      end

      it "the student is no longer in that list" do
        expect(find("#participants").text.include?('Mauno Tamminen')).to be(false)
      end

      it "the student can be added to the course once again" do
        resultview_include_string('Mauno Tamminen', true)

        page.find("a", :text => 'Mauno Tamminen').click

        resultview_include_string('Mauno Tamminen', false)
        expect(find("#participants").text.include?('Mauno Tamminen')).to be(true)
      end
    end
  end
end

def visit_course_creation_page
 visit '/'
 click_button 'Create a new course'
end

def fill_course_name_and_assignment_count_with(course_name, assignment_count)
  fill_in('courseName', with: course_name)
  fill_in('assignmentCount', with: assignment_count)
end

def fill_first_name_with(first_name)
  fill_in('firstName', with: first_name)
end

def fill_last_name_with(last_name)
  fill_in('lastName', with: last_name)
end

def submit_button_is_disabled
  expect(@button.visible?).to be(true)
  expect(@button[:disabled]).to eq("true")
end

def submit_button_is_enabled
  expect(@button[:disabled]).to be(nil)
end

def resultview_is_empty
  expect(find("#resultview").text).to be_empty
end

def resultview_include_string(string, bool)
  expect(find("#resultview").text.include?(string)).to be(bool)
end