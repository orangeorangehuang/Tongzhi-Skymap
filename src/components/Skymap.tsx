'use client';

import React, { useEffect, useRef, useState } from 'react';
import { drag, zoom } from 'd3';
import { select } from 'd3-selection';
import { geoPath, geoGraticule10 } from 'd3-geo';
// @ts-ignore
import { geoAitoff } from 'd3-geo-projection';

import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { starData, lineData, constData, milkyData, starOption, constOption, colorPalette, sizePalette } from '@/data/starData';
import { StarMetaData, ConstMetaData, Paragraph } from '@/types/starType';
import parse from 'html-react-parser';

const Skymap = () => {
  const router = useRouter();
  const svgRef = useRef(null);
  const starRef = useRef(null);
  const constRef = useRef(null);

  const [rotate, setRotate] = useState([0, -90]);
  const [searched, setSearched] = useState(false);
  const [isStar, setIsStar] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  // @ts-ignore
  const [starMetaData, setStarMetaData] = useState<StarMetaData>({});
  // @ts-ignore
  const [constMetaData, setConstMetaData] = useState<ConstMetaData>({});
  // @ts-ignore
  const [paragraphs, setParagraphs] = useState({ type: '', text: '' });
  const [mainParagraphs, setMainParagraphs] = useState([{ type: '', text: '' }]);
  const [filename, setFilename] = useState('');
  const searchParams = useSearchParams();
  let search_type = searchParams.get('type');
  let search_index = searchParams.get('index');
  let scale = 650;

  useEffect(() => {
    if (search_type === 'star' && search_index) {
      setIsStar(true);
      fetch(`/api/star/${search_index}`)
        .then((res) => res.json())
        .then((data) => {
          setStarMetaData(data.star);
        });
    } else if (search_type === 'const' && search_index) {
      setIsStar(false);
      fetch(`/api/const/${search_index}`)
        .then((res) => res.json())
        .then((data) => {
          setConstMetaData(data.const);
        });
    } else {
      setSearched(false);
      setSearchValue('');
    }
  }, []);

  useEffect(() => {
    if (starMetaData.lon) {
      fetch(`/api/document/${starMetaData.filename}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.document.paragraph[0].text !== paragraphs.text) {
            setParagraphs(data.document.paragraph[0]);
            setMainParagraphs(data.document.paragraph.slice(1));
          }
          setSearchValue(starMetaData.display_name);
          setSearched(true);
          setRotate([-parseFloat(starMetaData.lon), -parseFloat(starMetaData.lat)]);
        });
    }
  }, [starMetaData]);

  useEffect(() => {
    if (constMetaData.lon) {
      fetch(`/api/document/${constMetaData.filename}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.document.paragraph[0].text !== paragraphs.text) {
            setParagraphs(data.document.paragraph[0]);
            setMainParagraphs(data.document.paragraph.slice(1));
          }
          setSearchValue(constMetaData.display_name);
          setSearched(true);
          setRotate([-parseFloat(constMetaData.lon), -parseFloat(constMetaData.lat)]);
        });
    }
  }, [constMetaData]);

  const handleClick = (e: Event) => {
    e.stopPropagation();
    // @ts-ignore
    fetch(`/api/name/${e.target?.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.star) {
          setSearched(true);
          setIsStar(true);
          setStarMetaData(data.star);
          router.push(`/?type=star&index=${data.star.star_id}`);
          window.scrollTo(0, 0);
        } else if (data.const) {
          setSearched(true);
          setIsStar(false);
          setConstMetaData(data.const);
          router.push(`/?type=const&index=${data.const.const_id}`);
          window.scrollTo(0, 0);
        } else {
          router.push(`/`);
          setSearched(false);
          setRotate([0, -90]);
        }
      });
  };

  useEffect(() => {
    if (paragraphs.type !== '') {
      document.querySelectorAll('.star-tag').forEach((item) => {
        item.removeEventListener('click', handleClick);
        item.addEventListener('click', handleClick);
      });
    }
  }, [mainParagraphs]);

  // D3.js
  useEffect(() => {
    let svg = select(svgRef.current);
    let projection = geoAitoff()
      .scale(scale)
      .rotate(rotate)
      .translate([window.innerWidth * 0.65, window.innerHeight * 0.5]);
    let pathGenerator = geoPath(projection);

    svg
      .append('defs')
      .append('path')
      .datum({ type: 'Sphere' })
      .attr('id', 'sphere')
      .attr('d', pathGenerator({ type: 'Sphere' }));
    svg.append('use').attr('class', 'stroke').attr('xlink:href', '#sphere');
    svg.append('path').datum(geoGraticule10()).attr('class', 'stroke').attr('d', pathGenerator).exit().remove();

    // @ts-ignore
    svg.selectAll('.milkyWay').data(milkyData).enter().append('path').attr('d', pathGenerator).attr('class', 'milkyWay').exit().remove();
    // @ts-ignore
    svg
      .selectAll('.starline')
      .data(lineData)
      .enter()
      .append('path')
      // @ts-ignore
      .attr('d', pathGenerator)
      .attr('class', 'starLine')
      .attr('id', (d) => {
        return d.properties.line_id;
      })
      .exit()
      .remove();

    svg
      .selectAll('g')
      .data(starData)
      .enter()
      .append('g')
      .append('circle')
      .attr('cx', (d) => {
        return projection([+d.geometry.coordinates[0], +d.geometry.coordinates[1]])[0];
      })
      .attr('cy', (d) => {
        return projection([+d.geometry.coordinates[0], +d.geometry.coordinates[1]])[1];
      })
      .attr('r', 2)
      .attr('id', (d) => {
        return d.properties.id;
      })
      .style('fill', (d) => {
        return colorPalette[d.properties.color];
      })
      .exit()
      .remove();

    svg
      .selectAll('.starText')
      .data(starData)
      .enter()
      .append('text')
      .text((d) => {
        return d.properties.display_name;
      })
      // @ts-ignore
      .attr('d', pathGenerator)
      .attr('x', (d) => {
        return projection([+d.geometry.coordinates[0], +d.geometry.coordinates[1]])[0] - 10;
      })
      .attr('y', (d) => {
        return projection([+d.geometry.coordinates[0], +d.geometry.coordinates[1]])[1] - 5;
      })
      .attr('id', (d) => {
        return d.properties.id;
      })
      .attr('name', (d) => {
        return d.properties.name;
      })
      .attr('class', 'starText')
      .exit()
      .remove();

    svg
      .selectAll('.constellation')
      .data(constData)
      .enter()
      .append('text')
      .text((d) => {
        return d.properties.display_name;
      })
      // @ts-ignore
      .attr('d', pathGenerator)
      .attr('x', (d) => {
        return projection([+d.geometry.coordinates[0], +d.geometry.coordinates[1]])[0] - 15;
      })
      .attr('y', (d) => {
        return projection([+d.geometry.coordinates[0], +d.geometry.coordinates[1]])[1] - 5;
      })
      .attr('id', (d) => {
        return d.properties.id;
      })
      .attr('name', (d) => {
        return d.properties.name;
      })
      .style('fill', (d) => {
        return colorPalette['level' + d.properties.color];
      })
      .style('font-size', (d) => {
        return sizePalette['level' + d.properties.color];
      })
      .attr('class', 'constellation')
      .exit()
      .remove();
  }, []);

  useEffect(() => {
    let scale_temp = searched ? 1800 : 650;
    let svg = select(svgRef.current);
    let projection = geoAitoff()
      .scale(scale_temp)
      .rotate(rotate)
      .translate([window.innerWidth * 0.65, window.innerHeight * 0.5]);

    // Update Coorinates
    const updateCord = () => {
      svg.selectAll('path').attr('d', (d: any) => {
        return geoPath(projection)(d);
      });
      svg
        .selectAll('circle')
        .data(starData)
        .attr('cx', (d) => {
          return projection([+d.geometry.coordinates[0], +d.geometry.coordinates[1]])[0];
        })
        .attr('cy', (d) => {
          return projection([+d.geometry.coordinates[0], +d.geometry.coordinates[1]])[1];
        });
      svg
        .selectAll('.starText')
        .data(starData)
        .attr('x', (d) => {
          return projection([+d.geometry.coordinates[0], +d.geometry.coordinates[1]])[0] - 10;
        })
        .attr('y', (d) => {
          return projection([+d.geometry.coordinates[0], +d.geometry.coordinates[1]])[1] - 5;
        });
      svg
        .selectAll('.constellation')
        .data(constData)
        .attr('x', (d) => {
          return projection([+d.geometry.coordinates[0], +d.geometry.coordinates[1]])[0] - 15;
        })
        .attr('y', (d) => {
          return projection([+d.geometry.coordinates[0], +d.geometry.coordinates[1]])[1] - 5;
        });
    };

    // Drag Event
    const dragBehavior = drag<any, any>().on('drag', (event) => {
      const { dx, dy } = event;
      rotate[0] += dx * 0.25;
      rotate[1] -= dy * 0.25;
      projection.rotate(rotate);
      updateCord();
    });

    // Zoom Event
    const zoomBehavior = zoom<any, any>().on('zoom', (event) => {
      if (scale * event.transform.k < 300) projection.scale(300);
      else projection.scale(scale_temp * event.transform.k);
      updateCord();
    });

    svg.call(dragBehavior);
    svg.call(zoomBehavior);

    updateCord();
  }, [rotate]);

  useEffect(() => {
    document.querySelectorAll('.starText').forEach((item, i) => {
      item.addEventListener('click', (e: Event) => {
        e.preventDefault();
        router.push(`/?type=star&index=${item.id}`);
        fetch(`/api/star/${item.id}`)
          .then((res) => res.json())
          .then((data) => {
            setSearched(true);
            setIsStar(true);
            setStarMetaData(data.star);
          });
      });
    });
    document.querySelectorAll('.constellation').forEach((item, i) => {
      item.addEventListener('click', (e: Event) => {
        e.preventDefault();
        router.push(`/?type=const&index=${item.id}`);
        fetch(`/api/const/${item.id}`)
          .then((res) => res.json())
          .then((data) => {
            setSearched(true);
            setIsStar(false);
            setConstMetaData(data.const);
          });
      });
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    if (e.target.value === '') {
      router.push(`/`);
      setSearched(false);
      setRotate([0, -90]);
    }
  };

  const getIdFromName = () => {
    for (let i = 0; i < starOption.length; i++) {
      if (String(starOption[i].display_name).indexOf(String(searchValue)) > -1) {
        return [starOption[i].id, 'star'];
      }
    }
    for (let i = 0; i < constOption.length; i++) {
      if (String(constOption[i].display_name).indexOf(String(searchValue)) > -1) {
        return [constOption[i].id, 'const'];
      }
    }

    return [-1, 'not found'];
  };

  const handleInputSubmit = () => {
    const returnVal = getIdFromName();
    if (returnVal[0] === -1) return;
    else if (returnVal[1] === 'star') {
      router.push(`/?type=star&index=${returnVal[0]}`);
      fetch(`/api/star/${returnVal[0]}`)
        .then((res) => res.json())
        .then((data) => {
          setIsStar(true);
          setStarMetaData(data.star);
        });
    } else if (returnVal[1] === 'const') {
      router.push(`/?type=const&index=${returnVal[0]}`);
      fetch(`/api/const/${returnVal[0]}`)
        .then((res) => res.json())
        .then((data) => {
          setIsStar(false);
          setConstMetaData(data.const);
        });
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleInputSubmit();
    }
  };

  const handleDailyStarClick = (event: React.MouseEvent) => {
    event.preventDefault();
    // @ts-ignore
    router.push(`/?type=star&index=${event.target?.id}`);
    // @ts-ignore
    fetch(`/api/star/${event.target?.id}`)
      .then((res) => res.json())
      .then((data) => {
        setSearched(true);
        setIsStar(true);
        setStarMetaData(data.star);
      });
  };

  return (
    <div className='relative w-screen h-screen'>
      <svg
        ref={svgRef}
        style={{
          height: '100%',
          width: '100%',
          marginRight: '0px',
          marginLeft: '0px',
          backgroundColor: '#000000',
          // backgroundColor: '#111317',
        }}
      ></svg>

      <div className={`absolute top-0 left-0 w-[27.5rem] h-[100vh] bg-white ${searched ? 'block' : 'hidden'}`}></div>

      <div className='absolute top-5 left-5 w-[26rem] mb-[0.5rem] z-50'>
        {/* Search Bar */}
        <div className='w-[25rem] px-5 pt-[0.4rem] pb-[0.1rem] mb-[1rem] text-base rounded-lg bg-white drop-shadow-lg'>
          <input
            type='text'
            placeholder='搜尋星名或星官'
            value={searchValue}
            className='focus:outline-0 w-[20rem]'
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
          />
          <IconButton onClick={handleInputSubmit}>
            <SearchIcon />
          </IconButton>
        </div>

        {/* Search Options */}

        {/* Star of the Day */}
        <div className={`w-[25rem] h-[8rem] px-5 pt-[1rem] pb-[1rem] text-base rounded-lg bg-white ${searched ? 'hidden' : 'block'}`}>
          <div className='flex'>
            <div className='flex-auto w-[20rem] font-bold'>Star of the Day</div>
            <div className='flex-auto'>
              {(new Date().getMonth() + 1) % 12}/{new Date().getDate()}
            </div>
          </div>
          <div className='flex text-sm'>
            <div className='w-[17.5rem] mt-[1rem] ml-[0.5rem] text-slate-600'>{starOption[0].display_name}</div>
            <div
              className='mt-[0.8rem] ml-[0.5rem] px-[1rem] py-[0.3rem] bg-slate-300 rounded-lg hover:cursor-pointer hover:bg-slate-200'
              id={starOption[0].id}
              onClick={handleDailyStarClick}
            >
              查看
            </div>
          </div>
          <div className='w-[20rem] mt-[0.5rem] ml-[0.5rem] text-sm text-slate-600'>位於 {starOption[0].field}</div>
        </div>
      </div>

      {/* Display Area: Star */}
      <div className={`absolute top-[4rem] left-4 w-[26rem] h-[90vh] overflow-y-scroll ${searched && isStar ? 'block' : 'hidden'}`} ref={starRef}>
        <div className='px-5 mt-6'>
          <div className='flex'>
            <div className='text-2xl mb-2'>{starMetaData.display_name}</div>
            <div className='w-[3rem] h-[1.5rem] mt-[0.3rem] ml-[1rem] py-[0.1rem] pl-1 pr-1 bg-slate-800 rounded-lg text-sm text-center text-slate-100'>
              星名
            </div>
          </div>

          <div className='mb-3 text-base flex'>{starMetaData.const_name}</div>
          <div className='flex'>
            <div className='mb-1 text-base flex flex-auto'>
              <div className='w-[3rem] py-[0.25rem] px-2 bg-slate-200 rounded-lg text-sm/[1.5rem] text-center'>別名</div>
              <div className='py-1 px-2'>{starMetaData.prop_name}</div>
            </div>
            <div className='mb-1 text-base flex flex-auto'>
              <div className='w-[3rem] py-[0.25rem] px-2 bg-slate-200 rounded-lg text-sm/[1.5rem] text-center'>顏色</div>
              <div className='py-1 px-2'>{starMetaData.color}</div>
            </div>
          </div>
          <div className='mb-1 text-base flex flex-auto'>
            <div className='w-[3rem] py-[0.25rem] px-2 bg-slate-200 rounded-lg text-sm/[1.5rem] text-center'>RA</div>
            <div className='py-1 px-2'>{starMetaData.ra}</div>
          </div>
          <div className='mb-1 text-base flex flex-auto'>
            <div className='w-[3rem] py-[0.25rem] px-2 bg-slate-200 rounded-lg text-sm/[1.5rem] text-center'>DEC</div>
            <div className='py-1 px-2'>{starMetaData.dec}</div>
          </div>
        </div>
        <div className='h-[37rem] px-5 mt-5'>
          <div className='mb-5 p-3 bg-neutral-200 rounded-lg text-base leading-7'>
            <div className='mb-2 text-lg font-bold'>步天歌</div>
            <div className='font-serif'>{parse(paragraphs?.text)}</div>
          </div>

          <div className='text-base leading-7'>
            {mainParagraphs.map((p, i) => {
              return (
                <div key={i}>
                  <div className='mb-1 text-lg font-bold'>{p.type}</div>
                  <div className='mb-3'>{parse(p.text)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Display Area: Constellation */}
      <div className={`absolute top-[4rem] left-4 w-[26rem] h-[90vh] overflow-y-scroll ${searched && !isStar ? 'block' : 'hidden'}`} ref={constRef}>
        <div className='px-5 mt-6 flex'>
          <div className='text-2xl'>{constMetaData.display_name}</div>
          <div className='w-[3rem] h-[1.5rem] mt-[0.3rem] ml-[1rem] py-[0.1rem] pl-1 pr-1 bg-slate-800 rounded-lg text-sm text-center text-slate-100'>
            星官
          </div>
        </div>
        <div className='h-[37rem] px-5 mt-5'>
          <div className='mb-5 p-3 bg-neutral-200 rounded-lg text-base leading-7'>
            <div className='mb-2 text-lg font-bold'>步天歌</div>
            <div className='font-serif'>{parse(paragraphs?.text)}</div>
          </div>

          <div className='text-base leading-7'>
            {mainParagraphs.map((p, i) => {
              return (
                <div key={i}>
                  <div className='mb-1 text-lg font-bold'>{p.type}</div>
                  <div className='mb-3'>{parse(p.text)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skymap;
