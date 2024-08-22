import os

def dump_files(directory='.', output_file='project_dump.txt'):
    extensions = ('.py', '.js', '.json', '.txt')
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for root, dirs, files in os.walk(directory):
            if 'migrations' in dirs:
                dirs.remove('migrations')  # don't visit migrations directories
            
            for file in files:
                if file.endswith(extensions) and ('project_dump' not in file) and ('build' not in root) and ('db' not in file) and ('node_modules' not in root) and ('package-lock' not in file):
                    file_path = os.path.join(root, file)
                    outfile.write(f"File: {file_path}\n")
                    outfile.write("----------------------\n")
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            outfile.write(infile.read())
                    except Exception as e:
                        outfile.write(f"Error reading file: {str(e)}\n")
                    
                    outfile.write("\n\n")

    print(f"File dump completed. Output written to {output_file}")

if __name__ == "__main__":
    dump_files()
