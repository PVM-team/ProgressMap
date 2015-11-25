class SessionsController < ApplicationController
  def new
  end

  def create
    teacher = Teacher.find_by username: params[:username]
    if teacher && teacher.authenticate(params[:password])
      session[:user_id] = teacher.id
  #    redirect_to user_path(teacher), notice: "Welcome back!"
    else
      redirect_to :back, notice: "Username and/or password mismatch"
    end
  end

  def destroy
    session[:teacher_id] = nil
    redirect_to :root
  end
end