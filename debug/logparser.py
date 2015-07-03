log = open('out2.log','r')

for line in log:
    line = line.rstrip()
    line = line.split(' ')
    line = line[1:]
    print " ".join(line)
