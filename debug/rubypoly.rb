require 'matrix'
 
def regress x, y, degree
  x_data = x.map { |xi| (0..degree).map { |pow| (xi**pow).to_f } }
 
  mx = Matrix[*x_data]
  my = Matrix.column_vector(y)
 
  ((mx.t * mx).inv * mx.t * my).transpose.to_a[0]
end

def polysolve x, coeffs, degree
  result = 0
  for i in 0..degree
    result += coeffs[i]*(x**i)
  end
  return result
end

  

#x = [0,  1,  2,  3,  4,  5,  6,   7,   8,   9,   10];
#y = [1,  6,  17, 34, 57, 86, 121, 162, 209, 262, 321];

x = [ 0, 10, 20, 30, 40, 50, 60, 70, 80, 90,100,110, 120, 130, 140, 150]
#y = [ 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
y = [ 0, 0.8, 0.9, 0.1, -0.8, -1, -0.86223126, -0.7590495,  -0.79082087, -0.88725417, -0.88274428, -0.92077062, -0.80725119, -0.8859261,  -0.89528731, -0.8619345]

# xsample = x.slice(3,4)
# ysample = y.slice(3,4)
# coeffs = regress(xsample, ysample, 2)
# result = polysolve(8, coeffs, 2) 
# puts "coeffs #{coeffs} result for 7 = #{result} "



(0..5).each do |i|
  xsample = x.slice(i,4)
  ysample = y.slice(i,4)
  #puts "xsample #{xsample}"
  #puts
  coeffs = regress(xsample, ysample, 2)
  result = polysolve(x[i+5], coeffs, 2)
  puts "prediction #{i}: #{result} actual: #{y[i+5]}"
end
