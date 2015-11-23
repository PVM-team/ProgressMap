require 'rails_helper'
require 'rack/test'

describe "Creating Courses", type: :api do
  include Rack::Test::Methods

  def app
    Rails.application
  end

  describe "when a HTTP post request to '/courses/create' is done" do

    describe "and valid assignment_count and an empty array is given as students" do

      before :each do
        @assignment_count = 7

        expect(Course.count).to be(0)
        create_course("Ohtuprojekti", @assignment_count, [])

        @course = Course.first
      end

      it "a new course is saved to database" do
        expect(Course.count).to be(1)
      end

      it "given assignments are added to the course" do
        check_that_given_assignments_are_added_to_course(@assignment_count, @course)
      end

      it "there are no students in the course" do
        expect(@course.students.length).to be(0)
      end

      describe "and the HTTP response contains" do

        it "a code and message that refer to a valid request" do
          expect(@response["code"]).to be(201)
          expect(@response["message"].include?("created")).to be(true)
        end

        it "token of the created course" do
          expect(@response["token"].length).to be(SecureRandom.uuid.length)
          expect(@response["token"]).to eq(Course.last.token)
        end
      end
    end

    describe "and valid assignment_count and an array of students is given as students" do

      before :each do
        @assignment_count = 15
        @students = valid_students

        expect(Course.count).to be(0)
        create_course("Ohtuprojekti", @assignment_count, @students)

        @course = Course.first
      end

      it "a new course is saved to database" do
        expect(Course.count).to be(1)
      end

      it "given assignments are added to the course" do
        check_that_given_assignments_are_added_to_course(@assignment_count, @course)
      end

      it "given students are added to the course" do
        check_that_given_students_are_added_to_course(@students, @course)
      end

      describe "and the HTTP response contains" do

        it "a code and message that refer to a valid request" do
          expect(@response["code"]).to be(201)
          expect(@response["message"].include?("created")).to be(true)
        end

        it "token of the created course" do
          expect(@response["token"].length).to be(SecureRandom.uuid.length)
          expect(@response["token"]).to eq(Course.last.token)
        end
      end
    end

    describe "and the given course_name is missing" do

      before :each do
        @assignment_count = 15

        expect(Course.count).to be(0)

        json_params = {:assignment_count => @assignment_count, :students => valid_students }.to_json
        post_course_data_and_get_response(json_params)
      end

      it "no course is saved to database" do
        expect(Course.count).to be(0)
      end

      describe "and the HTTP response contains" do

        it "a code and message that refer to course_name being missing" do
          expect(@response["code"]).to be(400)
          expect(@response["message"].include?("course_name")).to be(true)
          expect(@response["message"].include?("missing")).to be(true)
        end
      end
    end

    describe "and the given course_name is invalid" do
        
      before :each do
        @assignment_count = 15

        expect(Course.count).to be(0)
        create_course("Å", @assignment_count, valid_students)
      end

      it "no course is saved to database" do
        expect(Course.count).to be(0)
      end

      describe "and the HTTP response contains" do

        it "a code and message that refer to an invalid course_name" do
          expect(@response["code"]).to be(400)
          expect(@response["message"].include?("Invalid")).to be(true)
          expect(@response["message"].include?("Å")).to be(true)
          expect(@response["message"].include?("course_name")).to be(true)
        end
      end

      describe "and the given students are invalid" do

        before :each do
          @assignment_count = 5

          expect(Course.count).to be(0)
          create_course("Å", @assignment_count, invalid_students3)
        end

        it "functions correctly and displays only info about invalid course_name" do
          expect(Course.count).to be(0)

          expect(@response["code"]).to be(400)
          expect(@response["message"].include?("Invalid")).to be(true)
          expect(@response["message"].include?("Å")).to be(true)
          expect(@response["message"].include?("course_name")).to be(true)
        end
      end
    end

    describe "and given students is an array and contains a student with invalid lastName" do

      before :each do
        @assignment_count = 4

        expect(Course.count).to be(0)
        create_course("Ohtuprojekti", @assignment_count, invalid_students1)
      end

      it "no course is saved to database" do
        expect(Course.count).to be(0)
      end

      describe "and the HTTP response contains" do

        it "a code and message that refer to the invalid student" do
          expect(@response["code"]).to be(400)
          expect(@response["message"].include?("Array")).to be(true)
          expect(@response["message"].include?("invalid student")).to be(true)
          expect(@response["message"].include?("Jorma ")).to be(true)
        end
      end
    end

    describe "and given students is an array and contains a student with invalid firstName" do

      before :each do
        @assignment_count = 4

        expect(Course.count).to be(0)
        create_course("Ohtuprojekti", @assignment_count, invalid_students2)
      end

      it "no course is saved to database" do
        expect(Course.count).to be(0)
      end

      describe "and the HTTP response contains" do

        it "a code and message that refer to the invalid student" do
          expect(@response["code"]).to be(400)
          expect(@response["message"].include?("Array")).to be(true)
          expect(@response["message"].include?("invalid student")).to be(true)
          expect(@response["message"].include?(" Erkkilä")).to be(true)
        end
      end
    end

    describe "and given students is an array and contains various students with invalid information" do

      before :each do
        @assignment_count = 4

        expect(Course.count).to be(0)
        create_course("Ohtuprojekti", @assignment_count, invalid_students3)
      end

      it "no course is saved to database" do
        expect(Course.count).to be(0)
      end

      describe "and the HTTP response contains" do

        it "a code and message that refer to the first invalid student" do
          expect(@response["code"]).to be(400)
          expect(@response["message"].include?("Array")).to be(true)
          expect(@response["message"].include?("invalid student")).to be(true)
          expect(@response["message"].include?("Jorma ")).to be(true)
        end
      end
    end    


    describe "and given students is an object that is not an array" do

      before :each do
        @assignment_count = 4

        expect(Course.count).to be(0)
        create_course("Ohtuprojekti", @assignment_count, invalid_students4)
      end

      it "no course is saved to database" do
        expect(Course.count).to be(0)
      end

      describe "and the HTTP response contains" do

        it "a code and message that refer to invalid students" do
          expect(@response["code"]).to be(400)
          expect(@response["message"].include?("students")).to be(true)
          expect(@response["message"].include?("not")).to be(true)
          expect(@response["message"].include?("array")).to be(true)
        end
      end
    end
  end
end

def create_course(course_name, assignment_count, students)
  json_params = {:course_name => course_name, :assignment_count => assignment_count, :students => students }.to_json
  post_course_data_and_get_response(json_params)
end

def post_course_data_and_get_response(json_params)
  response = post("/courses/create", json_params, "CONTENT_TYPE" => "application/json")
  @response = JSON.parse(response.body)
end

def check_that_response_contains_the_following(code, msg_part1, msg_part2)
  expect(@response["code"]).to be(code)
  expect(@response["message"].include?(msg_part1)).to be(true)
  expect(@response["message"].include?(msg_part2)).to be(true)
end

def valid_students
  [{'firstName': 'Mauno', 'lastName': 'Erkkilä'},
   {'firstName': 'Jonne', 'lastName': 'Kaukovaara'},
   {'firstName': 'Irmeli', 'lastName': 'Rinkilä'}]
end

def invalid_students1
  [{'firstName': 'Mauno', 'lastName': 'Erkkilä'},
   {'firstName': 'Jorma', 'lastName': ''},
   {'firstName': 'Irmeli', 'lastName': 'Rinkilä'}]
end

def invalid_students2
  [{'firstName': '', 'lastName': 'Erkkilä'},
   {'firstName': 'Jorma', 'lastName': 'Mattila'}]
end

def invalid_students3
  [{'firstName': 'Erkki', 'lastName': 'Erkkilä'},
   {'firstName': 'Jorma', 'lastName': 'Mattila'},
   {'firstName': 'Jorma', 'lastName': ''},
   {'firstName': '', 'lastName': 'Mattila'},
   {'firstName': '', 'lastName': 'Mattila'}]
end

def invalid_students4
  "lista opiskelijoita"
end

def check_that_given_students_are_added_to_course(students, course)
  expect(course.students.length).to be(students.length)

  for i in 0..students.length - 1
    expect(course.students[i].firstName).to eq(students[i][:firstName])
    expect(course.students[i].lastName).to eq(students[i][:lastName])
  end
end

def check_that_given_assignments_are_added_to_course(assignment_count, course)
  expect(course.assignments.length).to be(assignment_count)
  check_that_assignment_locations_are_valid(assignment_count, course)
end

def check_that_assignment_locations_are_valid(assignment_count, course)
  prev_location = nil
  direction = "left"

  for i in 0..assignment_count - 1
    location = course.assignments[i].location

    if (i % 4 == 0)
      if direction === 'left'
        direction = "right"
      else
        direction = "left"
      end
    end

    validate_location(location, i, assignment_count, direction, prev_location)

    prev_location = location
  end
end

def validate_location(location, index, assignment_count, direction, prev_location = nil)
    border_size = 1000 / 40
    block_size = 1000 / 5
    left_border = 50 + 2 * border_size
    top_border = 50 + 2 * border_size

    assignments_per_level = 4
    level_amount = (assignment_count / assignments_per_level) + 1

    if (direction === 'right')
        x_start = left_border + (index % assignments_per_level) * (2 * border_size + block_size)
    else
        x_start = left_border - (index % assignments_per_level) * (2 * border_size + block_size) + (assignments_per_level - 1) * (2 * border_size + block_size)
    end

    y_start = top_border + ((level_amount - (index / assignments_per_level)).ceil - 1) * (2 * border_size + block_size)

    expect(location.x >= x_start && location.x < x_start + block_size).to be(true)
    expect(location.y >= y_start && location.y < y_start + block_size).to be(true)

    expect(distance_between_locations(location, prev_location) >= 120).to be(true) if prev_location
end

def distance_between_locations(location1, location2)
  Math.sqrt((location1.x - location2.x) ** 2 + (location1.y - location2.y) ** 2)
end