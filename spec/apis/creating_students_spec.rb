require 'rails_helper'
require 'rack/test'

describe "Creating Students", type: :api do
  include Rack::Test::Methods

  def app
    Rails.application
  end

  before :each do
    FactoryGirl.create :course
    @course = FactoryGirl.create :course
    expect(Student.count).to be(0)
  end

  describe "when a HTTP post request to '/students' is done" do

    describe "and the given parameters are valid" do

      before :each do
        create_student(@course.id, "Erkki", "Mäkelä")
      end

      describe "a new student is saved to database" do

        before :each do
          expect(Student.count).to be(1)
        end

        it "and the added student is added to the students of the course with id '2'" do
          expect(Course.second.id).to be(2)
          expect(Course.second.students.length).to be(1)

          student = Course.second.students[0]
          expect(student.firstName).to eq("Erkki")
          expect(student.lastName).to eq("Mäkelä")
        end

        describe "and the HTTP response contains" do

          it "a code and message that refer to a valid request" do
            expect(@response["code"]).to be(201)
            expect(@response["message"]).to eq("created")
          end

          it "token of the created student" do
            expect(@response["token"].length).to be(SecureRandom.uuid.length)
          end
        end
      end
    end

    describe "and the given course_id doesn't refer to any course in database" do

      before :each do
        @id = Course.count + 1
        create_student(@id, "Erkki", "Mäkelä")
      end

      it "the student is not saved to database" do
        expect(Student.count).to be(0)
      end

      it "HTTP response contains error information about invalid course_id" do
        check_that_response_contains_the_following(400, "Invalid", "course_id: " + @id.to_s)
      end

      it "HTTP response doesn't provide a token" do
        expect(@response["token"]).to be(nil)
      end      
    end

    describe "and the firstName is empty" do

      before :each do
        create_student(@course.id, "", "Mäkelä")
      end

      it "the student is not saved to database" do
        expect(Student.count).to be(0)
      end

      it "HTTP response contains error information about empty firstName" do
        check_that_response_contains_the_following(400, "empty", "firstName")
      end

      it "HTTP response doesn't provide a token" do
        expect(@response["token"]).to be(nil)
      end
    end

    describe "and the lastName is empty" do

      before :each do
        create_student(@course.id, "Erkki", "")
      end

      it "the student is not saved to database" do
        expect(Student.count).to be(0)
      end

      it "HTTP response contains error information about empty lastName" do
        check_that_response_contains_the_following(400, "empty", "lastName")
      end

      it "HTTP response doesn't provide a token" do
        expect(@response["token"]).to be(nil)
      end
    end
  end
end

def create_student(course_id, firstName, lastName)
  params = {:course_id => course_id, :firstName => firstName, :lastName => lastName }
  response = post("/students", params)

  @response = JSON.parse(response.body)
end

def check_that_response_contains_the_following(code, msg_part1, msg_part2)
  expect(@response["code"]).to be(code)
  expect(@response["message"].include?(msg_part1)).to be(true)
  expect(@response["message"].include?(msg_part2)).to be(true)
end