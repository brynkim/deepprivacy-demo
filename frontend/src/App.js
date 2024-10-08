/* React State Management */
import { useState, useCallback } from 'react';

/* Material UI */
import { createTheme, GlobalStyles, ThemeProvider } from '@mui/material';
import { Container } from '@mui/material';
import { Typography } from '@mui/material';
import { Box } from '@mui/material';
import { Grid } from '@mui/material';
import { ImageList } from '@mui/material';
import { ImageListItem } from '@mui/material';
import { CircularProgress } from '@mui/material';

/* React Router DOM */
import { useNavigate, BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

/* React Dropzone */
import { useDropzone } from 'react-dropzone';

/* Fonts */
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

/* CSS Stylesheets */
import './App.css';

const sleep = delay => new Promise(resolve => setTimeout(resolve, delay));

const theme = createTheme({
    palette: {
        text: {
            primary: '#f0f0f0',
        },
    },
    typography: {
        allVariants: {
            color: '#f0f0f0',
        },
    },
});

const UploadPage = ({ setPath }) => {
    const navigate = useNavigate();
    var newpath = ''
    var reader = new FileReader();

    const onDrop = useCallback(async (files) => {
        setPath(files.map(file => {
            return URL.createObjectURL(file);
        }));

        reader.onload = async (e) => {
            e.preventDefault();

            const response = (await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(e.target.result)
            }))
            
            navigate('/result', {'state': await response.json()})
        }

        reader.readAsDataURL(files[0]);
        
        navigate('/wait');
    }, [setPath, navigate]);

    const {getRootProps, getInputProps} = useDropzone({
        onDrop,
        multiple: false
    });

    return (
        <Container sx={{zIndex: 3}} display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
            <Typography variant='h4' sx={{zIndex: 3}} display='flex' justifyContent='center'>Choose a photo to convert.</Typography>
            <Box display='flex' flexDirection='column' alignItems='center' height='32px'/>
            <Container component='section' className='container' style={{width: '50vw', height: '30vh', zIndex: 3}}>
                <Box component='article' display='flex' flexDirection='column' alignItems='center' justifyContent='center' width='100%' height='calc(100% - 6px)' backgroundColor='rgba(255, 255, 255, 0.1)' border='3px dashed white' borderRadius='10px' zIndex='3' {...getRootProps({className: 'dropzone'})}>
                    <input {...getInputProps()} />
                    <Typography variant='body1'>Drag 'n' drop some files here, or click to select files</Typography>
                </Box>
            </Container>
        </Container>
    );
};

const WaitPage = ({ path }) => {
    const navigate = useNavigate();

    return (
        <Container sx={{zIndex: 3}} display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
            <Grid container>
                <Grid item xs={12} md={3}>
                    <Typography variant='h4'>Original image.</Typography>
                    <Box component='div' height='32px' />
                    <ImageList sx={{width: '80%'}} cols={1}>
                        <ImageListItem key='image-original'>
                            <img src={path} loading="lazy" />
                        </ImageListItem>
                    </ImageList>
                </Grid>
                <Grid item xs={12} md={9}>
                    <Typography variant='h4'>Converted images.</Typography>
                    <Box component='div' height='32px' />
                    <Box component='article' height='50vh' display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
                        <CircularProgress onClick={() => navigate('/result')} />
                        <Box component='div' height='16px' />
                        <Typography>Waiting for conversion...</Typography>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

const ResultPage = ({ path, tempFiles, options }) => {
    const download = (e) => {
        const url = e.target.src;
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'image.png');
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
    const { state } = useLocation('state');
    const { onlyGen_closest, onlyGen_furthest, aihub_closest, aihub_furthest, cel_closest, cel_furthest } = state;

    const results = [onlyGen_closest, onlyGen_furthest, aihub_closest, aihub_furthest, cel_closest, cel_furthest]

    return (
        <Container sx={{zIndex: 3}} display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
            <Grid container>
                <Grid item xs={12} md={3}>
                    <Typography variant='h4'>Original image.</Typography>
                    <Box component='div' height='32px' />
                    <ImageList sx={{width: '80%'}} cols={1}>
                        <ImageListItem key='image-original'>
                            <img
                                src={path}
                                loading="lazy"
                            />
                        </ImageListItem>
                    </ImageList>
                </Grid>
                <Grid item xs={12} md={9}>
                    <Typography variant='h4'>Converted images.</Typography>
                    <Box component='div' height='32px' />
                    <Grid container sx={{height: '50vh'}}>
                        {results.flatMap((files, index1) => {
                            if (files === undefined) {
                                return null;
                            }
                            return (<Grid item md = {12} sm = {12}>
                                <Typography variant='h5'>{options[index1]}</Typography>
                                <hr />
                                <ImageList sx={{width: '90%', paddingRight: '16px'}} cols={5} key={'image-generated-' + index1}>
                                    {files.map((file, index2) => (
                                        <ImageListItem key={'image-generated-' + index1 + '-' + index2}>
                                            <img
                                                src={'data:image/jpg;base64,' + file}
                                                loading='lazy'
                                                className='image-candidate'
                                                onClick={e => download(e)}
                                            />
                                        </ImageListItem>
                                    ))}
                                </ImageList>
                                <div style={{width: '100%', height: '64px'}} />
                            </Grid>);
                        })}
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
};

const App = () => {
    const [path, setPath] = useState('');
    const options = ['Closest - Asian', 'Closest - Korean', 'Furthest - Asian', 'Furthest - Korean', 'Closest - Celebrity', 'Furthest - Celebrity']
    const tempFiles = [[path, path, path, path, path], [path, path, path, path, path], [path, path, path, path, path], [path, path, path, path, path], [path, path, path, path, path]]

    return (
        <ThemeProvider theme={theme}>
            <BrowserRouter>
                <GlobalStyles
                    styles={{
                        'html, body': {
                            margin: 0,
                            padding: 0,
                            width: '100vw',
                            height: '100vh',
                            overflowX: 'hidden',
                        },
                        '#root': {
                            width: '100%',
                            height: '100%',
                        },
                    }}
                />
                <Container component='header' />
                <Container component='main' sx={{height:'100vh'}} display='flex' flexDirection='column'>
                <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' minHeight='100vh'>
                        <img src={'./background.jpg'} style={{width: '100vw', minWidth: '100vw', aspectRatio : 1, maxHeight: '100vh', objectFit: 'cover', position: 'absolute'}} />
                        <Box component='div' display='flex' flexDirection='column' alignItems='center' sx={{position: 'absolute', backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 2, width: '100vw', height: '100vh'}} />
                        <Routes>
                            <Route path="/" element={<UploadPage setPath={setPath} />} />
                            <Route path="/wait" element={<WaitPage path={path} />} />
                            <Route path="/result" element={<ResultPage path={path} tempFiles={tempFiles} options={options} />} />
                        </Routes>
                    </Box>
                </Container>
                <Container component='footer' />
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
