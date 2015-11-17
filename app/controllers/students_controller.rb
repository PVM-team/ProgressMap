class StudentsController < ApplicationController

  def create
    params = JSON.parse(request.body.read.to_s)

    course = Course.find_by token: params["course_token"]
    @student = Student.new(:firstName => params["firstName"], :lastName => params["lastName"])

    if course and @student.save
      course.students << @student
      render_json(201, "created", @student.token)
    
    elsif course.nil?
      render_json(400, "Invalid parameter for course_token: " + params["course_token"]) if course.nil?

    else
      if @student.firstName.nil? or @student.firstName.empty?
        render_json(400, "Given parameter 'firstName' was empty or not provided.")

      elsif @student.lastName.nil? or @student.lastName.empty?
        render_json(400, "Given parameter 'lastName' was empty or not provided.")
      
      else
        render_json(600, "Unexpected behavior from valid input.\nStudent not saved.")
      end
    end
  end

  def show
    @assignments = []
    @course = []
    @student = []

    student = Student.find_by token: params[:token]

    if student
      course = student.course
      @course << course
      @assignments = course.assignments

      @student << student
    end

    render 'students/show.json.jbuilder'
  end

  def destroy
    student = Student.find_by id: params[:id]
    course_name = student.course.name
    
    student.destroy

    render plain: 'Student removed from course: ' + course_name
  end


  private

    def render_json(code, message, token = nil)
      params = {:code => code, :message => message}
      params[:token] = token if token

      render json: params.to_json
    end
end