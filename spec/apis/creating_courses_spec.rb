require 'rails_helper'
require 'rack/test'

describe "Creating Courses", type: :api do
  include Rack::Test::Methods

  def app
    Rails.application
  end

  describe "when a HTTP post request to '/courses/create' is done" do

    describe "and assignments are given without dependencies and students is an empty array" do

      before :each do
        @assignments = valid_assignments_without_dependencies

        expect(Course.count).to be(0)
        create_course("Ohtuprojekti", @assignments, [])

        @course = Course.last
      end

      it "a new course is saved to database" do
        expect(Course.count).to be(1)
      end

      it "given assignments are added to the course" do
        check_that_given_assignments_are_added_to_course(@assignments, @course)
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

    describe "and assignments are given with dependencies and an array of students is given as students" do

      before :each do
        @assignments = valid_assignments_with_dependencies
        @students = valid_students

        expect(Course.count).to be(0)
        create_course("Ohtuprojekti", @assignments, @students)

        @course = Course.last
      end

      it "a new course is saved to database" do
        expect(Course.count).to be(1)
      end

      it "given assignments are added to the course" do
        check_that_given_assignments_are_added_to_course(@assignments, @course)
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

    describe "and assignments are given with dependencies and students are not given" do

      before :each do
        expect(Course.count).to be(0)

        @assignments = valid_assignments_with_dependencies

        json_params = {:course_name => "Ohtuprojekti", :assignments => @assignments }.to_json
        post_course_data_and_get_response(json_params)

        @course = Course.last
      end

      it "a new course is saved to database" do
        expect(Course.count).to be(1)
      end

      it "given assignments are added to the course" do
        check_that_given_assignments_are_added_to_course(@assignments, @course)
      end

      it "no students are added to the course" do
        check_that_given_students_are_added_to_course([], @course)
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
        json_params = {:assignments => valid_assignments_without_dependencies, :students => valid_students }.to_json
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
        @assignments = valid_assignments_with_dependencies
        create_course("Å", @assignments, valid_students)
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
          create_course("Å", valid_assignments_without_dependencies, invalid_students3)
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
        create_course("Ohtuprojekti", valid_assignments_without_dependencies, invalid_students1)
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
        create_course("Ohtuprojekti", valid_assignments_without_dependencies, invalid_students2)
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
        create_course("Ohtuprojekti", valid_assignments_without_dependencies, invalid_students3)
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
        create_course("Ohtuprojekti", valid_assignments_with_dependencies, invalid_students4)
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


    describe "and given assignments contains an assignment with missing name attribute" do

      before :each do
        create_course("Ohtuprojekti", invalid_assignments_one_missing_name_attribute, valid_students)
      end

      it "no course is saved to database" do
        expect(Course.count).to be(0)
      end

      describe "and the HTTP response contains" do

        it "a code and message that refer to the invalid assignment" do
          expect(@response["code"]).to be(400)
          expect(@response["message"].include?("invalid assignment")).to be(true)
          expect(@response["message"].include?("number: 4")).to be(true)
        end
      end
    end

    describe "and given assignments contains an assignment with missing number attribute" do

      before :each do
        create_course("Ohtuprojekti", invalid_assignments_one_missing_number_attribute, valid_students)
      end

      it "no course is saved to database" do
        expect(Course.count).to be(0)
      end

      describe "and the HTTP response contains" do

        it "a code and message that refer to the invalid assignment" do
          expect(@response["code"]).to be(400)
          expect(@response["message"].include?("invalid assignment")).to be(true)
          expect(@response["message"].include?("name: Kakkostehtävä")).to be(true)
        end
      end
    end

    describe "and given assignments contains an assignment with invalid number attribute" do

      before :each do
        create_course("Ohtuprojekti", invalid_assignments_one_with_invalid_number, valid_students)
      end

      it "no course is saved to database" do
        expect(Course.count).to be(0)
      end

      describe "and the HTTP response contains" do

        it "a code and message that refer to the invalid assignment" do
          expect(@response["code"]).to be(400)
          expect(@response["message"].include?("invalid assignment")).to be(true)
          expect(@response["message"].include?("name: Kakkostehtävä")).to be(true)
        end
      end
    end

    describe "and given assignments contains an assignment with invalid dependencies" do

      describe "and one dependency list contains both valid and invalid information" do

        before :each do
          create_course("Ohtuprojekti", invalid_assignments_one_has_invalid_dependencies1, valid_students)
        end

        it "no course is saved to database" do
          expect(Course.count).to be(0)
        end

        describe "and the HTTP response contains" do

          it "a code and message that refer to the invalid assignment" do
            expect(@response["code"]).to be(400)
            expect(@response["message"].include?("invalid dependencies")).to be(true)
            expect(@response["message"].include?("name: Kolmostehtävä")).to be(true)
          end
        end
      end

      describe "and one dependency list is an object, but not an array" do

        before :each do
          create_course("Ohtuprojekti", invalid_assignments_one_has_invalid_dependencies2, valid_students)
        end

        it "no course is saved to database" do
          expect(Course.count).to be(0)
        end

        describe "and the HTTP response contains" do

          it "a code and message that refer to the invalid assignment" do
            expect(@response["code"]).to be(400)
            expect(@response["message"].include?("invalid dependencies")).to be(true)
            expect(@response["message"].include?("name: Kakkostehtävä")).to be(true)
          end
        end
      end

      describe "and one dependency list contains a dependency to assignment nr. 5 but there are only 4 assignments in course" do

        before :each do
          create_course("Ohtuprojekti", invalid_assignments_one_has_invalid_dependencies3, valid_students)
        end

        it "no course is saved to database" do
          expect(Course.count).to be(0)
        end

        describe "and the HTTP response contains" do

          it "a code and message that refer to the invalid assignment" do
            expect(@response["code"]).to be(400)
            expect(@response["message"].include?("invalid dependencies")).to be(true)
            expect(@response["message"].include?("name: Kolmostehtävä")).to be(true)
          end
        end
      end
    end

  end
end

def create_course(course_name, assignments, students)
  json_params = {:course_name => course_name, :assignments => assignments, :students => students }.to_json
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


def valid_assignments_with_dependencies
  assignments = []

  assignments << {'name': "Nelostehtävä", 'number': 4, 'dependencies': [1, 2, 3] }
  assignments << {'name': "Ykköstehtävä", 'number': 1 }
  assignments << {'name': "Viitostehtävä", 'number': 5, 'dependencies': [1, 4] }
  assignments << {'name': "Kakkostehtävä", 'number': 2, 'dependencies': [] }
  assignments << {'name': "Kolmostehtävä", 'number': 3, 'dependencies': [1] }

  for i in 6..15 do
    assignments << {'name': "Tehtävä" + i.to_s, 'number': i }
  end

  assignments
end

def valid_assignments_without_dependencies
  assignments = []

  assignments << {'name': "Kolmostehtävä", 'number': 3, 'dependencies': [] }
  assignments << {'name': "Ykköstehtävä", 'number': 1 }
  assignments << {'name': "Kakkostehtävä", 'number': 2 }

  for i in 4..15 do
    assignments << {'name': "Tehtävä" + i.to_s, 'number': i }
  end

  assignments
end

def invalid_assignments_one_missing_name_attribute
  assignments = []

  assignments << {'name': "Ykköstehtävä", 'number': 1 }
  assignments << {'name': "Kolmostehtävä", 'number': 3, 'dependencies': [1] }
  assignments << {'number': 4, 'dependencies': [1, 2, 3] }
  assignments << {'name': "Kakkostehtävä", 'number': 2, 'dependencies': [] }

  assignments
end

def invalid_assignments_one_missing_number_attribute
  assignments = []

  assignments << {'name': "Kakkostehtävä", 'dependencies': [] }
  assignments << {'name': "Ykköstehtävä", 'number': 1 }
  assignments << {'name': "Kolmostehtävä", 'number': 3, 'dependencies': [1] }
  assignments << {'name': "Nelostehtävä", 'number': 4, 'dependencies': [1, 2, 3] }

  assignments
end

def invalid_assignments_one_with_invalid_number
  assignments = []

  assignments << {'name': "Ykköstehtävä", 'number': 1 }
  assignments << {'name': "Kolmostehtävä", 'number': 3, 'dependencies': [1] }
  assignments << {'name': "Nelostehtävä", 'number': 4, 'dependencies': [1, 2, 3] }
  assignments << {'name': "Kakkostehtävä", 'number': 'kakkonen', 'dependencies': [] }

  assignments
end

def invalid_assignments_one_has_invalid_dependencies1
  assignments = []

  assignments << {'name': "Ykköstehtävä", 'number': 1 }
  assignments << {'name': "Kakkostehtävä", 'number': 2, 'dependencies': [] }
  assignments << {'name': "Nelostehtävä", 'number': 4, 'dependencies': [1, 3, 2] }
  assignments << {'name': "Kolmostehtävä", 'number': 3, 'dependencies': [2, 1, 'Ykköstehtävä'] }

  assignments
end

def invalid_assignments_one_has_invalid_dependencies2
  assignments = []

  assignments << {'name': "Kolmostehtävä", 'number': 3, 'dependencies': [] }
  assignments << {'name': "Ykköstehtävä", 'number': 1 }
  assignments << {'name': "Nelostehtävä", 'number': 4, 'dependencies': [1, 2, 3] }
  assignments << {'name': "Kakkostehtävä", 'number': 2, 'dependencies': 'Ykköstehtävä' }

  assignments
end

def invalid_assignments_one_has_invalid_dependencies3
  assignments = []

  assignments << {'name': "Ykköstehtävä", 'number': 1 }
  assignments << {'name': "Kakkostehtävä", 'number': 2, 'dependencies': [] }
  assignments << {'name': "Nelostehtävä", 'number': 4, 'dependencies': [1, 2, 3] }
  assignments << {'name': "Kolmostehtävä", 'number': 3, 'dependencies': [2, 5] }

  assignments
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

def check_that_given_assignments_are_added_to_course(assignments, course)
  expect(course.assignments.length).to be(assignments.length)

  assignments = assignments.sort_by { |a| a[:number] }

  check_that_assignments_have_right_names(assignments, course)
  check_that_assignments_have_right_numbers(assignments, course)
  check_that_assignment_locations_are_valid(course)
  check_that_assignment_dependencies_are_valid(assignments, course)
end

def check_that_assignments_have_right_names(assignments, course)
  for i in 0..assignments.length - 1
    expect(course.assignments[i].name).to eq(assignments[i][:name])
  end
end

def check_that_assignments_have_right_numbers(assignments, course)
  for i in 0..assignments.length - 1
    expect(course.assignments[i].number).to be(assignments[i][:number])
  end
end

def check_that_assignment_locations_are_valid(course)
  assignment_count = course.assignments.length
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


def check_that_assignment_dependencies_are_valid(assignments, course)
  for i in 0..assignments.length - 1
    given_dependencies = assignments[i][:dependencies]
    produced_dependencies = course.assignments[i].dependencies

    expect(produced_dependencies.length).to be(0) unless given_dependencies
    expect(produced_dependencies.length).to be(given_dependencies.length) if given_dependencies

    if produced_dependencies.length > 0

      for i in 0..given_dependencies.length - 1
        expect(produced_dependencies[i].number).to be(given_dependencies[i])
      end
    end
  end
end