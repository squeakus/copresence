require 'matrix'
 
def regress x, y, degree
  x_data = x.map { |xi| (0..degree).map { |pow| (xi**pow).to_f } }
 
  mx = Matrix[*x_data]
  my = Matrix.column_vector(y)
 
  ((mx.t * mx).inv * mx.t * my).transpose.to_a[0]
  puts "MX" + mx.to_s
end

x = [ 0, 10, 20, 30, 40, 50, 60, 70, 80, 90,100,110, 120, 130, 140, 150]
y = [ 0, 0.8, 0.9, 0.1, -0.8, -1, -1.15924044, -1.17749586, -1.32043957, -1.17819788, -1.07945751, -1.18166244, -1.2638849, -1.45028928, -1.31209642, -1.26559883]

xsample = x.slice(3,4)
ysample = y.slice(3,4)
regress(xsample, ysample, 3)

(0..5).each do |i|
 "predict #{i}: "
end

puts "Hello World!"+xsample.to_s;
