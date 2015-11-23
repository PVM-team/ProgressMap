require 'rails_helper'

describe "Course creation page", js: true do

  before :all do
    self.use_transactional_fixtures = false
  end

  before :each do
    DatabaseCleaner.strategy = :truncation
    DatabaseCleaner.start

    FactoryGirl.create :course

    FactoryGirl.create :student
    FactoryGirl.create :student, firstName: "Erkki", lastName: "Mäkelä"
    FactoryGirl.create :student, firstName: "Mauno", lastName: "Tamminen"
    FactoryGirl.create :student, firstName: "Etunimi", lastName: "Sukunimi"
    FactoryGirl.create :student, firstName: "Mauno", lastName: "Tammi"

    visit_course_creation_page
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
      @assignment_count = 26

      fill_course_name_and_assignment_count_with('makkara', @assignment_count.to_s)
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

      describe "there is a button for each one of the made assignments in that page" do

        before :each do
          for i in 1..@assignment_count
            find_button(i.to_s)
          end
        end

        it "and the buttons are located inside the 'blocks' they belong to in the canvas" do
          direction = "left"

          for i in 0..@assignment_count - 1
            button = find_button((i + 1).to_s)
            
            x_loc = x_loc(button)
            y_loc = y_loc(button)

            validate_location(x_loc, y_loc, i, @assignment_count)
          end
        end
      end
    end
  end

  describe "when assignmentCount is filled with a valid value" do

    before :each do
      fill_in('assignmentCount', with: '7')
    end

    it "the canvas is displayed on the page" do
      page.find("canvas")
    end

    it "buttons for assignments are created" do
      for i in 1..7
        find_button(i.to_s)
      end
    end

    it "Generate new map button is displayed" do
        find_button('Generate new map')
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

def submit_button_is_disabled
  button = page.find('button', :text => 'Submit')
  expect(button.visible?).to be(true)
  expect(button[:disabled]).to eq("true")
end

def submit_button_is_enabled
  button = page.find('button', :text => 'Submit')
  expect(button[:disabled]).to be(nil)
end

def x_loc(button)
  (button[:style].split("left: ")[1]).split("px")[0].to_i + 5
end

def y_loc(button)
  (button[:style].split("top: ")[1]).split("px")[0].to_i + 25
end

def validate_location(x_loc, y_loc, index, assignment_count)
  border_size = 1000 / 40
  block_size = 1000 / 5
  left_border = 50 + 2 * border_size
  top_border = 50 + 2 * border_size

  assignments_per_level = 4
  level_amount = (assignment_count / assignments_per_level) + 1

  if index % (2 * assignments_per_level) >= assignments_per_level
    direction = "left"
  else
    direction = "right"
  end

  if (direction === 'right')
    x_start = left_border + (index % assignments_per_level) * (2 * border_size + block_size)
  else
    x_start = left_border - (index % assignments_per_level) * (2 * border_size + block_size) + (assignments_per_level - 1) * (2 * border_size + block_size)
  end

  y_start = top_border + ((level_amount - (index / assignments_per_level)).ceil - 1) * (2 * border_size + block_size)

  expect(x_loc >= x_start && x_loc < x_start + block_size).to be(true)
  expect(y_loc >= y_start && y_loc < y_start + block_size).to be(true)
end