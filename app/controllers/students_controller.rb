class StudentsController < ApplicationController

  def create
    course = Course.find_by id: params[:course_id]
    @student = Student.new(student_params)

    if course and @student.save
      course.students << @student
    end
    render json: @student
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




  # PATCH/PUT /students/1
  # PATCH/PUT /students/1.json
  def update
    respond_to do |format|
      if @student.update(student_params)
        format.html { redirect_to @student, notice: 'Student was successfully updated.' }
        format.json { render :show, status: :ok, location: @student }
      else
        format.html { render :edit }
        format.json { render json: @student.errors, status: :unprocessable_entity }
      end
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_student
      @student = Student.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def student_params
      params.require(:student).permit(:firstName, :lastName)
    end
end
