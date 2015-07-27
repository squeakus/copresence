infile = open('hours.txt','r')
total = 0

for line in infile:
    line = line.split(' ')
    total += int(line[1])
print total
