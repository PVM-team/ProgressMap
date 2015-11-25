class TeachersController < ApplicationController

  def index
    @teachers = Teacher.all
  end

  def show
  end

  def new
    @teacher = Teacher.new
  end

  def edit
  end

  def destroy
  end

  private
    def teacher_params
      params.require(:teacher).permit(:username, :password, :password_confirmation)
   end
end