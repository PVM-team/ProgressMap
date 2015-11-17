require 'rails_helper'
require 'rack/test'

describe "Creating Courses", type: :api do
  include Rack::Test::Methods

  def app
    Rails.application
  end

  describe "when a HTTP post request to '/courses/create' is done" do

    describe "and the given parameters are valid" do

      before :each do
        @assignment_count = 18

        expect(Course.count).to be(0)
        create_course("Ohtuprojekti", @assignment_count, valid_students)
      end

      it "a new course is saved to database" do
        expect(Course.count).to be(1)
      end

      it "given assignments are added to the course" do
        expect(Course.first.assignments.length).to be(@assignment_count)
      end

      it "given students are added to the course" do
        expect(Course.first.students.length).to be(valid_students.length)
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
  end
end

def create_course(course_name, assignment_count, students)
  json_params = {:course_name => course_name, :assignment_count => assignment_count, :students => students }.to_json
  response = post("/courses/create", json_params, "CONTENT_TYPE" => "application/json")

  @response = JSON.parse(response.body)
end

def check_that_response_contains_the_following(code, msg_part1, msg_part2)
  expect(@response["code"]).to be(code)
  expect(@response["message"].include?(msg_part1)).to be(true)
  expect(@response["message"].include?(msg_part2)).to be(true)
end

def valid_students
  students = []

  for i in 1..3
    students << {'firstName': 'first' + i.to_s, 'lastName': 'last' + i.to_s}
  end
  students
end