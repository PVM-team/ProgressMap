class StudentsController < ApplicationController

  def all
    @students = Student.all
    render 'students/all.json.jbuilder'
  end

  def create
    course = Course.find_by id: params[:course_id]
    @student = Student.new(student_params)

    if course and @student.save
      course.students << @student
    end
    render json: @student
  end

  def add_to_course
    course = Course.find_by id: params[:course_id]
    student = Student.find_by id: params[:student_id]

    if course and student
      course.students << student
    end

    render plain: 'Student added to course: ' + course.name
  end

  def remove_from_course
    student = Student.find_by id: params[:student_id]
    course_name = student.course.name
    
    student.course = nil
    student.save

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

  # DELETE /students/1
  # DELETE /students/1.json
  def destroy
    @student.destroy
    respond_to do |format|
      format.html { redirect_to students_url, notice: 'Student was successfully destroyed.' }
      format.json { head :no_content }
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
